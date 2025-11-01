# Voice Clone Studio - Design Guidelines

## Design Approach

**Reference-Based Approach with Modern AI Tool Inspiration**

Drawing from contemporary AI audio tools like ElevenLabs, Descript, and Resemble AI, combined with Material Design principles for consistency. The design emphasizes a tech-forward, professional aesthetic that signals advanced AI capabilities while maintaining approachability for creator audiences.

---

## Core Design Elements

### A. Color Palette

**Primary Colors:**
- **Dark Mode (Default):** 
  - Background: 220 20% 12% (deep navy-charcoal)
  - Surface: 220 18% 18% (elevated panels)
  - Primary brand: 262 83% 58% (vibrant purple - AI/tech association)
  - Success/Active: 142 76% 36% (mint green for recording states)

- **Light Mode:**
  - Background: 0 0% 98% (soft white)
  - Surface: 0 0% 100% (pure white panels)
  - Primary brand: 262 83% 58% (consistent purple)
  - Success/Active: 142 71% 45% (slightly deeper mint)

**Accent Colors:**
- Audio waveform: 195 92% 56% (electric cyan for visualizations)
- Warning/Processing: 38 92% 50% (amber for training status)
- Error states: 0 84% 60% (soft red)

**Text Colors:**
- Dark mode: 0 0% 95% (primary), 0 0% 65% (secondary)
- Light mode: 220 18% 20% (primary), 220 15% 45% (secondary)

### B. Typography

**Font Stack:**
- **Primary:** 'Inter' (Google Fonts) - clean, modern, excellent readability
- **Monospace:** 'JetBrains Mono' - for technical details (model IDs, durations)
- **Display:** 'Inter' with varying weights (500-700)

**Scale:**
- Hero/Page titles: text-3xl to text-4xl, font-semibold
- Section headers: text-xl to text-2xl, font-medium
- Body text: text-base, font-normal
- Captions/metadata: text-sm, text-secondary

### C. Layout System

**Spacing Primitives:**
Use Tailwind units: **2, 3, 4, 6, 8, 12, 16** for consistent rhythm
- Component padding: p-4 to p-6
- Section spacing: gap-6 to gap-8
- Card/panel spacing: p-6 to p-8
- Tight groupings: gap-2 to gap-3

**Grid Structure:**
- Main container: max-w-6xl mx-auto (optimized for iframe)
- Two-column layouts for upload/record split
- Single column stack on mobile (< 768px)
- Consistent 16-24px outer padding

### D. Component Library

**Navigation & Header:**
- Minimal top bar with app branding and user indicator
- Tab-based navigation for workflow steps: Record → Clone → Generate
- Sticky positioning for easy access
- Border-b with subtle divider

**Cards & Panels:**
- Rounded corners: rounded-xl (12px)
- Subtle shadows: shadow-lg with colored glow on hover
- Border: 1px solid with low opacity (border-white/10 dark, border-gray/20 light)
- Background blur for glassmorphic effect on overlays

**Voice Recorder Component:**
- Circular record button (96px) with pulsing animation when active
- Waveform visualization using canvas/WebAudio API (electric cyan)
- Timer display in monospace font
- Clear visual states: idle → recording → processing

**File Upload Zone:**
- Dashed border drag-drop area (border-dashed, border-2)
- Icon + text prompt centered
- File preview with filename and size
- Remove/replace actions

**Model Cards:**
- Voice clone thumbnail or initial avatar
- Model name (editable inline)
- Status badge (Created/Training/Ready) with color coding
- Timestamp and metadata in secondary text
- Action menu (delete, test, select)

**Text-to-Speech Interface:**
- Large textarea for input text (min-h-32)
- Voice selector dropdown with avatar previews
- Generate button (prominent, primary color)
- Character count indicator

**Audio Player:**
- Custom controls (play/pause, progress bar, volume)
- Waveform visualization (matches recording style)
- Download button with format indicator (MP3)
- Share/copy link options (if applicable)

**Progress Indicators:**
- Linear progress bars for training (with percentage)
- Skeleton loaders for loading states
- Spinner for quick actions
- Status toasts for confirmations/errors

### E. Interactions & States

**Animations (Minimal, Purposeful):**
- Record button pulse: `animate-pulse` when active
- Smooth transitions: `transition-all duration-300 ease-in-out`
- Page transitions: fade-in with slight slide-up
- Loading states: subtle skeleton shimmer

**Button States:**
- Hover: slight scale (scale-105) + brightness increase
- Active/Focus: ring-2 with primary color
- Disabled: opacity-50 + cursor-not-allowed
- Glass buttons on images: backdrop-blur-md bg-white/10

**Interactive Feedback:**
- Haptic-like visual responses (micro-bounce on click)
- Color shifts on status changes
- Toast notifications for async actions
- Optimistic UI updates where appropriate

---

## Images

**Hero Section:** 
Full-width background showcasing abstract audio waveforms or AI-generated voice visualization (gradient mesh with flowing particles). Image should convey technology and creativity - consider using a subtle animated gradient or particle system for visual interest.

**Model Cards:**
Circular avatar placeholders for voice clones (can use initials or generated icons). Consider colorful gradient backgrounds unique to each model.

**Onboarding/Empty States:**
Illustrative graphics showing recording process, voice waves, or AI processing concepts. Use minimal line-art style consistent with the tech-forward aesthetic.

---

## Special Considerations

**Whop Iframe Optimization:**
- Avoid fixed positioning (except for critical modals)
- Respect parent container width
- Ensure all interactions work within iframe sandbox
- Test scrolling behavior thoroughly

**Accessibility:**
- WCAG AA contrast ratios (4.5:1 minimum)
- Focus indicators on all interactive elements
- ARIA labels for audio controls and status indicators
- Keyboard navigation for all workflows

**Performance:**
- Lazy load audio waveform visualizations
- Progressive enhancement for MediaRecorder API
- Optimize audio file uploads with compression hints
- Show clear progress for long-running operations (model training)

---

## Workflow-Specific Design

1. **Step 1 - Record/Upload:**
   Two-column layout (desktop) with prominent CTAs for each option. Clear visual separation between recording interface (left) and upload zone (right).

2. **Step 2 - Model Training:**
   Centered progress view with model details, estimated time, and cancellation option. Use engaging visuals (animated waveform or AI processing visualization).

3. **Step 3 - Text-to-Speech:**
   Focus on text input area with voice selector above. Generated audio results appear below with playback controls immediately visible.

4. **Model Library:**
   Grid of voice model cards (2-3 columns) with quick actions. Include search/filter if user has many models.