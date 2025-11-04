import '@testing-library/jest-dom';
import 'whatwg-fetch'; // Polyfill fetch for tests
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;