// src/setupTests.js
import '@testing-library/jest-dom';
import React from 'react';
import { TextEncoder, TextDecoder } from 'util';
import { ReadableStream } from 'stream/web';
import fetch, { Headers, Request, Response } from 'node-fetch';

// Mock para HTMLCanvasElement.prototype.getContext
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
    }),
    writable: false,
  });
});

// Polyfills para TextEncoder y TextDecoder
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Polyfill para ReadableStream
global.ReadableStream = ReadableStream;

// Polyfills para fetch (Headers, Request, Response)
global.fetch = fetch;
global.Headers = Headers;
global.Request = Request;
global.Response = Response;

// Mock de firebaseConfig.js
jest.mock('./firebaseConfig', () => ({
  app: { name: 'mocked-app' }, // Mocked app object
}));

// Mock de firebase/app
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(() => ({ name: 'mocked-app' })),
}));

// Mock de firebase/auth
jest.mock('firebase/auth', () => {
  const mockAuth = {
    currentUser: {
      uid: '12345',
      displayName: 'Test User',
      email: 'testuser@example.com',
    },
    signOut: jest.fn(() => Promise.resolve()),
  };

  class MockGoogleAuthProvider {
    constructor() {}
  }

  return {
    __esModule: true,
    getAuth: jest.fn(() => mockAuth),
    onAuthStateChanged: jest.fn((authInstance, callback) => {
      callback(mockAuth.currentUser);
      return jest.fn();
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
  };
});

// Mock de firebase/firestore
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
}));

// Mock de componentes que no son relevantes para la prueba
jest.mock('./components/userComponents/ModalNotification', () => () => <div>Mocked ModalNotification</div>);

// Mock de jsPDF si es necesario
jest.mock('jspdf', () => {
  return jest.fn().mockImplementation(() => ({
    text: jest.fn(),
    addImage: jest.fn(),
    save: jest.fn(),
  }));
});
