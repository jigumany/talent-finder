
'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://gslstaging.mytalentcrm.com/api/v1/talent-finder';

// Helper to format validation errors from Laravel
function formatValidationErrors(errors: Record<string, string[]>): string {
  return Object.values(errors).flat().join(' ');
}

const LoginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

export async function login(values: z.infer<typeof LoginSchema>) {
  const validatedFields = LoginSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: 'Invalid email or password.' };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(validatedFields.data),
    });

    const result = await response.json();

    if (!result.success) {
      if (result.errors) {
        return { error: formatValidationErrors(result.errors) };
      }
      return { error: result.message || 'Login failed. Please check your credentials.' };
    }

    if (!result.data.token) {
        return { error: 'Login failed: No token received from server.' };
    }

    (await cookies()).set('session_token', result.data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax',
      maxAge: 8 * 60 * 60, // 8 hours to match cache
    });

    return { success: true };

  } catch (error) {
    console.error('Login action error:', error);
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}

export async function logout() {
  const token = (await cookies()).get('session_token')?.value;

  if (token) {
      try {
          await fetch(`${API_BASE_URL}/logout`, {
              method: 'POST',
              headers: {
                  'Authorization': `Bearer ${token}`,
                  'Accept': 'application/json',
              }
          });
      } catch (error) {
          console.error("Logout API call failed:", error);
          // We still proceed to delete the local cookie
      }
  }

  (await cookies()).delete('session_token');
  redirect('/');
}

export async function validateInvitation(token: string) {
  if (!token) return { error: 'Invalid invitation link.' };
  try {
    const response = await fetch(`${API_BASE_URL}/validate-invitation?token=${token}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });
    const result = await response.json();
    if (!result.success) {
      return { error: result.message || 'Invitation is invalid or has expired.' };
    }
    // The API now nests the data
    return { success: true, email: result.data.email };
  } catch (error) {
    console.error('Validate invitation error:', error);
    return { error: 'An unexpected error occurred while validating the invitation.' };
  }
}


const SetupPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
  password_confirmation: z.string(),
}).refine(data => data.password === data.password_confirmation, {
    message: "Passwords don't match",
    path: ['password_confirmation'],
});

export async function setupPassword(values: z.infer<typeof SetupPasswordSchema>) {
    const validatedFields = SetupPasswordSchema.safeParse(values);
    if (!validatedFields.success) {
        return { error: 'Invalid data provided.' };
    }

    try {
        const response = await fetch(`${API_BASE_URL}/setup-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(validatedFields.data),
        });

        const result = await response.json();

        if (!result.success) {
            if (result.errors) {
              return { error: formatValidationErrors(result.errors) };
            }
            return { error: result.message || 'Failed to set up password.' };
        }
        return { success: true, message: result.message || 'Password has been set successfully! You can now log in.' };
    } catch (error) {
        console.error('Setup password error:', error);
        return { error: 'An unexpected error occurred while setting up the password.' };
    }
}
