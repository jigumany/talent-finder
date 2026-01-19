
'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const API_BASE_URL = 'https://gslstaging.mytalentcrm.com/api/v1/talent-finder';

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

    if (!response.ok || !result.token) {
      return { error: result.message || 'Login failed. Please check your credentials.' };
    }

    cookies().set('session_token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 1 day
    });

    return { success: true };

  } catch (error) {
    console.error('Login action error:', error);
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}

export async function logout() {
  cookies().delete('session_token');
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
    if (!response.ok) {
      return { error: result.message || 'Invitation is invalid or has expired.' };
    }
    return { success: true, email: result.email }; // Assuming API returns email
  } catch (error) {
    console.error('Validate invitation error:', error);
    return { error: 'An unexpected error occurred while validating the invitation.' };
  }
}


const SetupPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
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

        if (!response.ok) {
            return { error: result.message || 'Failed to set up password.' };
        }
        return { success: true, message: result.message || 'Password has been set successfully! You can now log in.' };
    } catch (error) {
        console.error('Setup password error:', error);
        return { error: 'An unexpected error occurred while setting up the password.' };
    }
}
