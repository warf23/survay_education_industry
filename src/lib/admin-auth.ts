'use client';

import { jwtDecode } from 'jwt-decode';

// Type for the JWT token payload
type TokenPayload = {
  email: string;
  exp: number;
};

// Function to sign in
export async function signIn(email: string, password: string): Promise<boolean> {
  // Check if the credentials match the environment variables
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD || '123456'; // Fallback for testing
  
  if (email === adminEmail && password === adminPassword) {
    // Create a JWT token (in a real app, this would be done server-side)
    const token = createToken(email);
    
    // Store the token in localStorage
    localStorage.setItem('admin_token', token);
    
    return true;
  }
  
  return false;
}

// Function to check if the user is authenticated
export async function checkAuth(): Promise<boolean> {
  try {
    const token = localStorage.getItem('admin_token');
    
    if (!token) {
      return false;
    }
    
    // Decode the token to check if it's expired
    const decoded = jwtDecode<TokenPayload>(token);
    
    // Check if the token is expired
    if (decoded.exp < Date.now() / 1000) {
      // Token is expired, remove it
      localStorage.removeItem('admin_token');
      return false;
    }
    
    // Check if the email matches the admin email
    if (decoded.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
}

// Function to sign out
export async function signOut(): Promise<boolean> {
  try {
    localStorage.removeItem('admin_token');
    return true;
  } catch (error) {
    console.error('Error signing out:', error);
    return false;
  }
}

// Function to create a JWT token
function createToken(email: string): string {
  // This is a simple implementation for demo purposes
  // In a real app, this would be done server-side with a proper JWT library
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };
  
  const payload = {
    email: email,
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // 24 hours
  };
  
  const base64Header = btoa(JSON.stringify(header));
  const base64Payload = btoa(JSON.stringify(payload));
  
  // In a real app, this would be signed with a secret key
  // For demo purposes, we're just concatenating the parts
  return `${base64Header}.${base64Payload}.demo_signature`;
} 