# Frontend Design Guidelines: Sammer Digital Marketing Portfolio

## Architecture & Navigation

### Authentication
- **Admin Only**: No public registration
- **Credentials**: sameerliaqat81@gmail.com / Q4WVicB636c]
- **Access**: Settings > Admin Login
- **Implementation**: Mock auth with local state, secure session persistence
- **Logout**: Confirmation alert in admin panel

### Navigation Structure
**Tab Bar (5 tabs)**:
1. Home - Hero, services, CTAs
2. Services - 8 categories
3. Portfolio - Projects + filters
4. About - Bio, skills, testimonials
5. Contact - Communication channels

**Admin Stack** (post-login): Dashboard > Inquiries/Portfolio/Service Manager

**Service Categories**:
SEO | Web Dev | Android App Dev | Graphic Design | Social Media | Branding/UX | AI Automation | AI Chatbots

---

## Screen Layouts & Safe Areas

### Home
- **Header**: Transparent, Settings icon (top-right)
- **Content**: Hero gradient banner, 2-col service grid (8 cards), 3 CTA buttons
- **Safe Area**: Top (headerHeight + 24px), Bottom (tabBarHeight + 24px)

### Services Tab
- **List**: 8 service cards (icon, title, tagline, arrow)
- **Detail**: Header banner, description, offerings checklist, timeline/pricing cards, "Submit Inquiry" CTA
- **Detail Header**: Back, service name, Inquiry button (right)
- **Safe Area Detail**: Top (headerHeight + 24px), Bottom (24px)

### Inquiry Form (Modal)
- **Header**: "New Inquiry", Cancel (left), Submit (right - disabled until valid)
- **Fields**: Name, Email, Phone, Service (dropdown), Budget (segmented/slider), Message (textarea), Attachment
- **Validation**: Real-time with inline errors
- **Safe Area**: Top (headerHeight + 16px), Bottom (16px)

### Portfolio
- **Filters**: Horizontal scrolling chips (All, Web, App, Design, etc.)
- **Grid**: 2-column or masonry project cards (thumbnail, title, category tag)
- **Detail**: Image carousel, description, deliverables, external link, "Request Similar" (header-right)
- **Safe Area**: Top (24px), Bottom (tabBarHeight + 24px)

### About
- **Sections**: Profile image, bio, skills (chips/progress bars), experience timeline, achievements, testimonials carousel
- **Testimonials**: Horizontal scrolling cards (quote, name, company, avatar)
- **Safe Area**: Top (headerHeight + 24px), Bottom (tabBarHeight + 24px)

### Contact
- **Layout**: Centered action cards: WhatsApp (green), Email, Call
- **Social Links**: Icon grid (Facebook, Instagram, LinkedIn, GitHub, Website)
- **Safe Area**: Top (24px), Bottom (tabBarHeight + 24px)

### Settings
- **Sections**: Appearance (Dark/Light toggle), About (version), Admin Access button
- **Safe Area**: Top (headerHeight + 16px), Bottom (16px)

### Admin Dashboard
- **Metrics**: Cards for Total/New/Pending/Completed inquiries
- **Charts**: Weekly activity, Most Requested Service
- **Quick Actions**: View Inquiries, Manage Portfolio/Services
- **Header**: Logout (right)

### Admin Inquiry Management
- **List**: Cards with name, service, date, status badge (Pending/In Progress/Completed)
- **Detail**: All form fields (read-only), attachment preview, admin notes, actions (Add Note, Mark Status, Email, Delete)
- **Header**: Filter icon (right)

### Admin Portfolio CMS
- **Grid**: Project cards with edit/delete icons
- **FAB**: "Add Project" (bottom-right, 16px from right, 88px from bottom)
- **Add/Edit Modal**: Title, Description, Category, Images (multi-upload), Link fields
- **Safe Area**: Bottom (88px for FAB clearance)

### Admin Service Manager
- **List**: Services with visibility toggles, tap to edit
- **Header**: Add Service icon (right)

---

## Design System

### Colors
```
Primary: #6366F1 (Indigo) - CTAs, links, active
Secondary: #8B5CF6 (Purple) - Accents, gradients
Success: #10B981 - WhatsApp, confirmations
Warning: #F59E0B - Pending status
Error: #EF4444 - Errors, delete

Light Mode:
  Background: #FFFFFF
  Surface: #F8FAFC
  Text Primary: #0F172A
  Text Secondary: #64748B
  Border: #E2E8F0

Dark Mode:
  Background: #0F172A
  Surface: #1E293B
  Text Primary: #F1F5F9
  Text Secondary: #94A3B8
  Border: #334155

Gradients:
  Hero: Linear #6366F1 → #8B5CF6 (45deg)
  Card Accent: 10% opacity overlays
```

### Typography (System Default: SF/Roboto)
```
Hero Title: 32px Bold, -0.5px letter-spacing
Page Title: 24px Bold
Section Header: 20px Semibold
Body Large: 17px Regular
Body: 15px Regular
Caption: 13px Regular
Button: 16px Semibold

Line Heights: 1.4x (body), 1.2x (headings)
```

### Spacing Scale
```
xs: 4px | sm: 8px | md: 16px | lg: 24px | xl: 32px | xxl: 48px
```

### Components

**Cards**:
- Border radius: 16px
- Border: 1px solid Border color
- Padding: 16px
- **NO drop shadows** (except FAB)

**Buttons**:
```
Primary: Filled Primary bg, white text, 12px radius, 48px height
Secondary: Outlined Primary border, Primary text, 40px height
Text: No bg, Primary text
States: Pressed (90% opacity), Disabled (40% opacity)
```

**FAB**:
```
Size: 56x56px circle
Background: Primary
Icon: White, 24px
Position: 16px from right, 88px from bottom
Shadow: height 2, opacity 0.10, radius 2
```

**Input Fields**:
```
Height: 48px
Border radius: 12px
Border: 1px Border color (2px Primary on focus)
Background: Surface
Padding: 12px horizontal
Error: Red border + message below
```

**Service Cards**:
```
Aspect: 1:1 or 3:2
Icon: 32x32px (Feather)
Title: 16px Semibold
Subtitle: 13px Secondary
Press: Scale 0.98
```

**Status Badges**:
```
Height: 24px
Border radius: 12px (pill)
Padding: 6px horizontal
Text: 12px Semibold
Colors: Success (Completed), Warning (Pending), Primary (In Progress)
```

### Icons (Feather from @expo/vector-icons)
```
Sizes: 24px (nav), 20px (inline), 32px (features)
Color: Matches text hierarchy

Mapping:
  home, briefcase, grid, user, message-circle, settings, shield
  log-out, plus, edit-2, trash-2, search, filter
  mail, phone (+ branded: WhatsApp, Facebook, Instagram, LinkedIn, GitHub)
```

### Accessibility (WCAG AA)
- Touch target: 44x44px min
- Contrast: 4.5:1 for text
- Focus states on all interactive elements
- Visible form labels
- Error messages linked to fields
- Loading indicators & empty states

### Animations
```
Screen transitions: 300ms push/pop
Modal: 350ms slide-up
Button press: Scale 0.98 (spring)
List items: Fade-in, 50ms stagger
Carousel: Swipe with momentum
Tab switch: 200ms crossfade
```

### Glassmorphism (Hero Only - Optional)
```
Background: 20% opacity overlay
Backdrop blur: 10px
Border: 1px, 30% opacity
Use sparingly for readability
```

---

## Platform Guidelines

**iOS**: HIG navigation, swipe-back gestures, native headers  
**Android**: Material 3, back buttons in headers, ripple effects  
**Cross-platform**: Consistency with platform-specific navigation patterns

---

## Assets & Resources

**Required**:
1. Admin avatar (1x, geometric/abstract professional style)
2. Portfolio placeholder images
3. Social brand icons (use expo-vector-icons community or react-native-vector-icons)

**Icons**: Feather only, no emoji in production UI

---

## Critical Dos & Don'ts

✅ **DO**:
- Use Feather icons consistently
- Maintain 44px min touch targets
- Apply subtle borders to cards (no shadows except FAB)
- Validate forms in real-time
- Show loading/empty states
- Respect safe areas per screen specs

❌ **DON'T**:
- Use emojis in UI (icons only)
- Add drop shadows to regular cards
- Skip accessibility contrast checks
- Hardcode spacing (use spacing scale)
- Ignore platform-specific navigation patterns