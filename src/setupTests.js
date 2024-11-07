// src/setupTests.js
import '@testing-library/jest-dom';
import React from 'react';
import { TextEncoder, TextDecoder } from 'util';
import { ReadableStream } from 'stream/web';
import fetch, { Headers, Request, Response } from 'node-fetch';

// Mock for HTMLCanvasElement.prototype.getContext
beforeAll(() => {
  Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
    value: () => ({
      fillRect: jest.fn(),
      clearRect: jest.fn(),
      getImageData: jest.fn(() => ({
        data: [],
        width: 0,
        height: 0,
      })),
      putImageData: jest.fn(),
      createImageData: jest.fn(),
      setTransform: jest.fn(),
      drawImage: jest.fn(),
      save: jest.fn(),
      restore: jest.fn(),
      scale: jest.fn(),
      rotate: jest.fn(),
      translate: jest.fn(),
      transform: jest.fn(),
      measureText: jest.fn(() => ({ width: 0 })),
      // Add more methods as needed
    }),
    writable: false,
  });
});

// Polyfills for TextEncoder and TextDecoder
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Polyfill for ReadableStream
global.ReadableStream = ReadableStream;

// Polyfills for fetch (Headers, Request, Response)
global.fetch = fetch;
global.Headers = Headers;
global.Request = Request;
global.Response = Response;

// Mock firebaseConfig.js
jest.mock('./firebaseConfig', () => ({
  app: { name: 'mocked-app' }, // Mocked app object
}));

// Mock firebase/app
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(() => ({ name: 'mocked-app' })),
}));

// Mock firebase/auth
jest.mock('firebase/auth', () => {
  // Define a mocked auth object
  const mockAuth = {
    currentUser: {
      uid: '12345',
      displayName: 'Test User',
      email: 'testuser@example.com',
    },
    signOut: jest.fn(() => Promise.resolve()),
    // Mock other methods as needed
  };

  // Define a class for GoogleAuthProvider
  class MockGoogleAuthProvider {
    constructor() {}
    // Add methods if necessary
  }

  return {
    __esModule: true, // For proper ES6 module handling
    getAuth: jest.fn(() => mockAuth),
    onAuthStateChanged: jest.fn((authInstance, callback) => {
      callback(mockAuth.currentUser);
      return jest.fn(); // Mock unsubscribe function
    }),
    GoogleAuthProvider: MockGoogleAuthProvider,
    signInWithPopup: jest.fn(() => Promise.resolve({
      user: mockAuth.currentUser,
    })),
    createUserWithEmailAndPassword: jest.fn(() => Promise.resolve({
      user: mockAuth.currentUser,
    })),
    signInWithEmailAndPassword: jest.fn(() => Promise.resolve({
      user: mockAuth.currentUser,
    })),
    // Mock other functions as needed
  };
});

// Mock firebase/firestore
jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => ({})),
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  onSnapshot: jest.fn(),
  getDocs: jest.fn(() => Promise.resolve({
    size: 0,
    empty: true,
    docs: [],
  })),
  // Mock other Firestore functions as needed
}));

// Mock components that are not relevant for the test
jest.mock('./components/userComponents/ModalNotification', () => () => <div>Mocked ModalNotification</div>);

// Mock jsPDF if necessary
jest.mock('jspdf', () => {
  return jest.fn().mockImplementation(() => ({
    text: jest.fn(),
    addImage: jest.fn(),
    save: jest.fn(),
    // Add more methods as needed
  }));
});

// Optional: Silence the warning about ReactDOMTestUtils.act (Not Recommended)
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (/ReactDOMTestUtils\.act/.test(args[0])) {
      return;
    }
    originalConsoleError(...args);
  };
});

afterAll(() => {
  console.error = originalConsoleError;
});
