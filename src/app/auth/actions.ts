
'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const API_BASE_URL =  process.env.NEXT_PUBLIC_API_BASE_URL || 'https://gslstaging.mytalentcrm.com/api/v1/talent-finder';

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
    const url = `${API_BASE_URL}/login`;
    console.log(`Attempting to login to: ${url}`);
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(validatedFields.data),
    });

    const resultText = await response.text();
    const result = JSON.parse(resultText);

    if (!result.success) {
      console.error('Login API returned an error:', result.message || result.errors);
      if (result.errors) {
        return { error: formatValidationErrors(result.errors) };
      }
      return { error: result.message || 'Login failed. Please check your credentials.' };
    }

    if (!result.data?.token) {
        console.error('Login successful, but no token was provided in the response.');
        return { error: 'Login failed: No token received from server.' };
    }
    
    console.log('✅ Login successful. Token received.');

    (await cookies()).set('session_token', result.data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax',
      maxAge: 8 * 60 * 60, // 8 hours to match cache
    });
    
    console.log('✅ Session cookie set.');

    return { success: true };

  } catch (error) {
    console.error('--- LOGIN ACTION FAILED ---');
    if (error instanceof Error) {
        console.error('Error Type:', error.name);
        console.error('Error Message:', error.message);
        if ('cause' in error) {
             console.error('Underlying Cause:', error.cause);
        }
        console.error('-----------------------------');
        // Check for a common local development issue
        if (error.message.includes('fetch failed')) {
            console.error('Hint: A "fetch failed" error often means the Next.js server could not connect to the API URL.');
            console.error('Please ensure your Laravel server is running and accessible at the URL defined in your .env file:', process.env.NEXT_PUBLIC_API_BASE_URL);
        }
    } else {
        console.error('An unknown error occurred:', error);
    }

    if (error instanceof SyntaxError) {
        return { error: 'Failed to parse the server response. It might not be valid JSON.' };
    }
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
          console.log('Logged out from API.');
      } catch (error) {
          console.error("Logout API call failed:", error);
          // We still proceed to delete the local cookie
      }
  }

  (await cookies()).delete('session_token');
  console.log('Session cookie deleted.');
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
    