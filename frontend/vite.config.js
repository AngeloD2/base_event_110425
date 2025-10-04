/**
 * System: Base Event Platformer
 * Module: Vite Configuration
 * Purpose: Configure Vite with React plugin support for the platformer app
 */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
