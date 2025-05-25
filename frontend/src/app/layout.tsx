'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import Navigation from '@/components/Navigation';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const inter = Inter({ subsets: ['latin'] });

const theme = createTheme({
    palette: {
        mode: 'dark',
    },
});

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <ThemeProvider theme={theme}>
                    <CssBaseline />
                    <Navigation />
                    {children}
                </ThemeProvider>
            </body>
        </html>
    );
} 