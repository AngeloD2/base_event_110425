/**
 * System: Base Event Platformer
 * Module: Vite Configuration
 * Purpose: Configure Vite with React plugin support for the platformer app
 */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
