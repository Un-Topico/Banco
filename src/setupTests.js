// src/setupTests.js

import '@testing-library/jest-dom/extend-expect';
import { TextEncoder, TextDecoder } from 'util';
import { ReadableStream } from 'readable-stream';

// Mock Firebase Auth directly within jest.mock
jest.mock('firebase/auth', () => {
  const originalModule = jest.requireActual('firebase/auth');

  // Mock for GoogleAuthProvider
  class MockGoogleAuthProvider {
    constructor() {
      this.providerId = 'google.com';
    }
    // Add additional mock methods if necessary
  }

  return {
    ...originalModule,
    GoogleAuthProvider: MockGoogleAuthProvider,
    signInWithPopup: jest.fn(),
    reauthenticateWithPopup: jest.fn(),
    getAuth: jest.fn(() => ({
      currentUser: null, // Set to null to simulate an unauthenticated user
    })),
    onAuthStateChanged: jest.fn((auth, callback) => {
      // Simulate an unauthenticated user
      callback(null);
      return () => {};
    }),
    // Add other Firebase Auth methods you use
  };
});

// Mock Firebase Firestore
jest.mock('firebase/firestore', () => {
  return {
    getFirestore: jest.fn(() => ({})),
    query: jest.fn(),
    collection: jest.fn(),
    where: jest.fn(),
    onSnapshot: jest.fn((q, callback) => {
      // Simulate an empty snapshot
      callback({ size: 0 });
      return jest.fn(); // Return an unsubscribe function
    }),
  };
});

// Configure global objects if necessary
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
global.ReadableStream = ReadableStream; // Add this line
