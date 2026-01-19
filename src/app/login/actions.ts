'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase';

// Helper to get standard error messages
const getErrorMessage = (err: any) => {
    const msg = err?.message || err?.toString() || 'Unknown error';
    if (msg.includes('Invalid login credentials')) return 'Invalid email or password.';
    if (msg.includes('Email not confirmed')) return 'Account exists but email is not confirmed.';
    if (msg.includes('User already registered')) return 'Account already exists. Try logging in.';
    return msg;
};

export async function login(formData: FormData) {
    const supabase = await createClient();
    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    };

    const { error } = await supabase.auth.signInWithPassword(data);

    if (error) {
        console.error('Login Failed:', error);
        return { success: false, error: getErrorMessage(error) };
    }

    revalidatePath('/', 'layout');
    return { success: true };
}

export async function signup(formData: FormData) {
    const supabase = await createClient();
    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    };

    // Get the Site URL for redirection (fallback to origin request in client if needed, but here we set emailRedirectTo)
    // In Supabase Self-Hosted, this is crucial.
    const origin = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const { error } = await supabase.auth.signUp({
        ...data,
        options: {
            emailRedirectTo: `${origin}/auth/callback`,
        }
    });

    if (error) {
        console.error('Signup Failed:', error);
        return { success: false, error: getErrorMessage(error) };
    }

    revalidatePath('/', 'layout');
    return { success: true };
}
