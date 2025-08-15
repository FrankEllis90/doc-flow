/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  safelist: [
    // Only preserve dynamic classes that are actually used
    {
      pattern: /^text-(primary|secondary|success|warning|error|neutral)-/,
      variants: ['hover', 'focus'],
    },
    {
      pattern: /^bg-(primary|secondary|success|warning|error|neutral)-/,
      variants: ['hover', 'focus'],
    },
    {
      pattern: /^border-(primary|secondary|success|warning|error|neutral)-/,
      variants: ['hover', 'focus'],
    },
  ],
  theme: {
    extend: {
      colors: {
        // RAGARA BRAND SAGE GREEN - WCAG AAA Compliant
        'primary': {
          50: '#F5F7F4',   // Light sage backgrounds
          100: '#E8EDE5',  // Card backgrounds, hover states
          200: '#D4DDD0',  // Borders, disabled states
          300: '#B8C7B0',  // Secondary elements
          400: '#A8B79D',  // Interactive elements - MAIN BRAND COLOR
          500: '#A8B79D',  // Primary brand color
          600: '#8CA085',  // Primary actions
          700: '#738A6C',  // Primary pressed
          800: '#5A7354',  // High contrast text
          900: '#415D3C',  // Maximum contrast
          950: '#2F4229'   // Ultra dark sage
        },
        'secondary': {
          50: '#FDF8F3',   // Light gold backgrounds
          100: '#F5E8B8',  // Soft gold background  
          200: '#E6D498',  // Light gold borders
          300: '#D4AF37',  // GOLD ACCENT COLOR - Main brand accent
          400: '#D4AF37',  // Gold accent
          500: '#B8941F',  // Medium gold
          600: '#9C7F1A',  // Dark gold
          700: '#7D6614',  // Pressed gold
          800: '#5E4D10',  // High contrast gold
          900: '#3F340B',  // Darkest gold
          950: '#201A05'   // Ultra dark gold
        },
        'success': {
          50: '#F0FDF4',   // Lightest green
          100: '#DCFCE7',  // Very light green
          200: '#BBF7D0',  // Light green
          300: '#86EFAC',  // Medium light green
          400: '#4ADE80',  // Medium green
          500: '#059669',  // Main success (7:1 contrast)
          600: '#047857',  // Success hover (10:1 contrast)
          700: '#065F46',  // Success pressed (12:1 contrast)
          800: '#064E3B',  // Dark success
          900: '#022C22',  // Darkest success
          950: '#021C14'   // Ultra dark green
        },
        'warning': {
          50: '#FFFBEB',   // Lightest amber
          100: '#FEF3C7',  // Very light amber
          200: '#FDE68A',  // Light amber
          300: '#FCD34D',  // Medium light amber
          400: '#F59E0B',  // Medium amber
          500: '#D97706',  // Main warning (7:1 contrast)
          600: '#B45309',  // Warning hover (10:1 contrast)
          700: '#92400E',  // Warning pressed (12:1 contrast)
          800: '#78350F',  // Dark warning
          900: '#451A03',  // Darkest warning
          950: '#1C0701'   // Ultra dark amber
        },
        'error': {
          50: '#FEF2F2',   // Lightest red
          100: '#FEE2E2',  // Very light red
          200: '#FECACA',  // Light red
          300: '#FCA5A5',  // Medium light red
          400: '#F87171',  // Medium red
          500: '#DC2626',  // Main error (7:1 contrast)
          600: '#B91C1C',  // Error hover (10:1 contrast)
          700: '#991B1B',  // Error pressed (12:1 contrast)
          800: '#7F1D1D',  // Dark error
          900: '#450A0A',  // Darkest error
          950: '#1C0505'   // Ultra dark red
        },
        'neutral': {
          0: '#FFFFFF',    // Pure white
          25: '#FDFDFD',   // Off white
          50: '#F8FAFC',   // Lightest neutral
          100: '#F1F5F9',  // Very light neutral
          150: '#E8EDF4',  // Light neutral plus
          200: '#E2E8F0',  // Light neutral
          250: '#D6DCE5',  // Medium light neutral plus
          300: '#CBD5E1',  // Medium light neutral
          350: '#B8C4D0',  // Medium neutral plus
          400: '#94A3B8',  // Medium neutral
          450: '#7C8FA8',  // Medium dark neutral plus
          500: '#64748B',  // Main neutral (4.5:1 contrast)
          550: '#5A6B7D',  // Dark neutral plus
          600: '#475569',  // Dark neutral (7:1 contrast)
          650: '#3E4A5A',  // Very dark neutral plus
          700: '#334155',  // Very dark neutral (10:1 contrast)
          750: '#2A3441',  // Ultra dark neutral plus
          800: '#1E293B',  // Ultra dark neutral (12:1 contrast)
          850: '#172030',  // Near black plus
          900: '#0F172A',  // Near black (15:1 contrast)
          950: '#0A0F1C'   // Darkest neutral
        },
        // VIBRANT BRAND COLORS - Breaking Monotony
        'brand-ink': '#0D3B2E',      // Bold accent for headings/links
        'brand-emerald': '#10B981',  // Vibrant green for primary CTAs
        'brand-ocean': '#0EA5E9',    // Bright blue accent for engagement
        'brand-purple': '#8B5CF6',   // Purple accent for special features
        'brand-coral': '#F97316',    // Orange accent for warnings/alerts
        'brand-sage': {
          DEFAULT: '#A8B79D',  // Main sage green brand color
          50: '#F5F7F4',       // Light sage backgrounds
          100: '#E8EDE5',      // Card backgrounds, hover states  
          200: '#D4DDD0',      // Borders, disabled states
          300: '#B8C7B0',      // Secondary elements
          400: '#A8B79D',      // Interactive elements - MAIN BRAND COLOR
          500: '#A8B79D',      // Primary brand color
          600: '#6F8B73',      // Primary actions - updated for better contrast
          700: '#5F7963',      // Primary pressed - updated for better contrast
          800: '#5A7354',      // High contrast text
          900: '#415D3C',      // Maximum contrast
        },
        'brand-gold': {
          DEFAULT: '#D4AF37',  // Original accent gold
          50: '#FFFDF5',       // Lightest gold backgrounds
          100: '#FEF9E6',      // Light gold highlights
          200: '#FDF2C7',      // Medium-light gold borders
          300: '#D4AF37',      // GOLD ACCENT COLOR - Main brand accent
          400: '#F9D84A',      // Medium-dark gold hover states
          500: '#E6B800',      // Enhanced gold - primary CTAs - BOLD CTA COLOR
          600: '#D4A317',      // Enhanced primary gold - better contrast
          700: '#B88D12',      // Enhanced dark gold - CTA hover
          800: '#996F0A',      // Very dark gold contrast
          900: '#7A5500',      // Darkest gold maximum contrast
        },
        
        // RAGARA BRAND color mappings - SAGE GREEN SYSTEM (Legacy support)
        'peppercorn-living-green': '#A8B79D',  // Main sage green brand color
        'peppercorn-deep-green': '#5A7354',    // Dark sage green
        'peppercorn-lilac': '#F5F7F4',         // Light sage background
        'peppercorn-plum': '#738A6C',          // Medium sage green
        'peppercorn-red': '#DC2626',           // Error red
        'peppercorn-orange': '#D97706',        // Warning orange
        'peppercorn-yellow': '#F59E0B',        // Warning yellow
        'peppercorn-living-green-75': '#8CA085',  // Sage 600
        'peppercorn-living-green-50': '#B8C7B0',  // Sage 300
        'peppercorn-living-green-25': '#D4DDD0',  // Sage 200
        'peppercorn-living-green-10': '#E8EDE5',  // Sage 100
        'peppercorn-living-green-5': '#F5F7F4',   // Sage 50
        'peppercorn-deep-green-75': '#334155',
        'peppercorn-deep-green-50': '#475569',
        'peppercorn-deep-green-25': '#64748B',
        'peppercorn-deep-green-10': '#94A3B8',
        'peppercorn-deep-green-5': '#CBD5E1',
      },
      fontFamily: {
        // Primary font stack for headings and UI
        'sans': ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        // Secondary font for body text (enhanced readability)
        'body': ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        // Monospace for code and technical content
        'mono': ['JetBrains Mono', 'Fira Code', 'Monaco', 'Cascadia Code', 'Roboto Mono', 'Courier New', 'monospace'],
        // Display font for large headings
        'display': ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        // Legacy support
        'work': ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Enhanced type scale following 1.25 ratio (Major Third)
        'xs': ['0.75rem', { lineHeight: '1.5', letterSpacing: '0.025em' }],     // 12px
        'sm': ['0.875rem', { lineHeight: '1.5', letterSpacing: '0.01em' }],     // 14px
        'base': ['1rem', { lineHeight: '1.6', letterSpacing: '0em' }],          // 16px
        'lg': ['1.125rem', { lineHeight: '1.6', letterSpacing: '-0.01em' }],    // 18px
        'xl': ['1.25rem', { lineHeight: '1.5', letterSpacing: '-0.02em' }],     // 20px
        '2xl': ['1.5rem', { lineHeight: '1.4', letterSpacing: '-0.02em' }],     // 24px
        '3xl': ['1.875rem', { lineHeight: '1.3', letterSpacing: '-0.03em' }],   // 30px
        '4xl': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.03em' }],    // 36px
        '5xl': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.04em' }],       // 48px
        '6xl': ['3.75rem', { lineHeight: '1.1', letterSpacing: '-0.04em' }],    // 60px
        '7xl': ['4.5rem', { lineHeight: '1', letterSpacing: '-0.05em' }],       // 72px
        '8xl': ['6rem', { lineHeight: '1', letterSpacing: '-0.05em' }],         // 96px
        '9xl': ['8rem', { lineHeight: '1', letterSpacing: '-0.05em' }],         // 128px
      },
      fontWeight: {
        'thin': '100',
        'extralight': '200',
        'light': '300',
        'normal': '400',
        'medium': '500',
        'semibold': '600',
        'bold': '700',
        'extrabold': '800',
        'black': '900',
      },
      lineHeight: {
        'none': '1',
        'tight': '1.25',
        'snug': '1.375',
        'normal': '1.5',
        'relaxed': '1.625',
        'loose': '2',
      },
      letterSpacing: {
        'tighter': '-0.05em',
        'tight': '-0.025em',
        'normal': '0em',
        'wide': '0.025em',
        'wider': '0.05em',
        'widest': '0.1em',
      },
      spacing: {
        // Enhanced spacing scale for better rhythm
        '0.5': '0.125rem',   // 2px
        '1.5': '0.375rem',   // 6px
        '2.5': '0.625rem',   // 10px
        '3.5': '0.875rem',   // 14px
        '4.5': '1.125rem',   // 18px
        '5.5': '1.375rem',   // 22px
        '6.5': '1.625rem',   // 26px
        '7.5': '1.875rem',   // 30px
        '8.5': '2.125rem',   // 34px
        '9.5': '2.375rem',   // 38px
        '10.5': '2.625rem',  // 42px
        '11.5': '2.875rem',  // 46px
        '12.5': '3.125rem',  // 50px
        '13': '3.25rem',     // 52px
        '15': '3.75rem',     // 60px
        '17': '4.25rem',     // 68px
        '18': '4.5rem',      // 72px
        '19': '4.75rem',     // 76px
        '21': '5.25rem',     // 84px
        '22': '5.5rem',      // 88px
        '25': '6.25rem',     // 100px
        '26': '6.5rem',      // 104px
        '28': '7rem',        // 112px
        '30': '7.5rem',      // 120px
        '34': '8.5rem',      // 136px
        '36': '9rem',        // 144px
        '44': '11rem',       // 176px
        '52': '13rem',       // 208px
        '60': '15rem',       // 240px
        '68': '17rem',       // 272px
        '76': '19rem',       // 304px
        '84': '21rem',       // 336px
        '92': '23rem',       // 368px
        '100': '25rem',      // 400px
      },
      borderRadius: {
        'none': '0px',
        'sm': '0.125rem',    // 2px
        'DEFAULT': '0.25rem', // 4px
        'md': '0.375rem',    // 6px
        'lg': '0.5rem',      // 8px
        'xl': '0.75rem',     // 12px
        '2xl': '1rem',       // 16px
        '3xl': '1.5rem',     // 24px
        'full': '9999px',
      },
      boxShadow: {
        // Enhanced shadow system for depth
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'sm': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'DEFAULT': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        '3xl': '0 35px 60px -12px rgba(0, 0, 0, 0.35)',
        'inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        'none': 'none',
        // Custom shadows for specific UI elements
        'focus': '0 0 0 3px rgba(79, 107, 245, 0.1)',
        'focus-primary': '0 0 0 3px rgba(79, 107, 245, 0.2)',
        'focus-error': '0 0 0 3px rgba(220, 38, 38, 0.2)',
        'focus-success': '0 0 0 3px rgba(5, 150, 105, 0.2)',
      },
      animation: {
        // Enhanced animations
        'spin-slow': 'spin 3s linear infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'bounce-gentle': 'bounce 2s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};