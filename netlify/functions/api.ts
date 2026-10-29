/**
 * SETUVANA - Netlify Serverless Function Entry Point
 * Wraps Express application with serverless-http for Netlify Functions deployment
 */

import serverless from 'serverless-http';
import { app } from '../../src/serverApp.ts';

export const handler = serverless(app);
