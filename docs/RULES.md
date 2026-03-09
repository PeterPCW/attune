# Attune Rules API Documentation

This document provides comprehensive details about all rules in Attune.

## Summary

- **Total Rules**: 448
- **Categories**: 36

### By Severity

| Severity | Count |
|----------|-------|
| Critical | 35 |
| High | 115 |
| Medium | 179 |
| Low | 103 |
| Info | 16 |

### By Category

| Category | Rules |
|----------|-------|
| security | 77 |
| architecture | 70 |
| performance | 56 |
| accessibility | 36 |
| typescript | 21 |
| usability | 13 |
| error-handling | 11 |
| maintainability | 11 |
| css | 9 |
| api | 8 |
| cicd | 8 |
| cleanliness | 8 |
| docker | 8 |
| graphql | 7 |
| payments | 7 |
| testing | 6 |
| email | 6 |
| i18n | 6 |
| kubernetes | 6 |
| migrations | 6 |
| reliability | 6 |
| monitoring | 6 |
| uploads | 6 |
| websockets | 6 |
| api-versioning | 5 |
| cli | 5 |
| cors | 5 |
| documentation | 5 |
| queues | 5 |
| caching | 4 |
| complexity | 4 |
| dependencies | 3 |
| graphql-subscriptions | 3 |
| forms | 2 |
| state | 2 |
| react | 1 |

---

## Rules Reference

## Accessibility

### A11Y_AUTOPLAY_MEDIA: Auto-playing media without controls

**Severity**: HIGH | **Category**: accessibility

Auto-playing audio/video must have controls and respect user preference.

**What it catches:**
- Media auto-plays with sound
- No controls for user
- WCAG audio control violation

**How to fix:**
- Don't auto-play with sound
- Add controls to media elements
- Respect prefers-reduced-motion

**Recommendation**: Don't auto-play media with sound
**Library**: WCAG 2.1 - Audio Control

**Applies to**: All frameworks


**Source**: `src/rules/data/accessibility.json`

---

### A11Y_CAPTCHA_ALT: CAPTCHA without accessible alternative

**Severity**: HIGH | **Category**: accessibility

CAPTCHA should have audio alternative or be replaceable with less exclusionary method.

**What it catches:**
- CAPTCHA without accessible alternative
- Users with disabilities can't complete verification
- WCAG CAPTCHA violation

**How to fix:**
- Add audio alternative for CAPTCHA
- Consider hCaptcha or similar
- Use invisible CAPTCHA when possible

**Recommendation**: Provide CAPTCHA alternatives
**Library**: WCAG 2.1 - CAPTCHA

**Applies to**: All frameworks


**Source**: `src/rules/data/accessibility.json`

---

### A11Y_COGNITIVE_LOAD: Complex language may cause cognitive load

**Severity**: MEDIUM | **Category**: accessibility

Avoid complex sentences and jargon. Aim for reading level appropriate for audience.

**What it catches:**
- Complex language and jargon
- Content hard to understand
- Cognitive accessibility issues

**How to fix:**
- Use simple, clear language
- Avoid jargon when possible
- Break up complex content

**Recommendation**: Use clear, simple language
**Library**: WCAG 2.1 - Cognitive

**Applies to**: All frameworks
**File Extensions**: .html, .jsx, .tsx, .vue, .svelte

**Source**: `src/rules/data/accessibility.json`

---

### A11Y_CONSISTENT_NAV: Inconsistent navigation across pages

**Severity**: MEDIUM | **Category**: accessibility

Navigation should be consistent across pages for predictability.

**What it catches:**
- Navigation changes between pages
- Users can't predict navigation patterns
- WCAG consistency violation

**How to fix:**
- Keep navigation consistent
- Use same order and labels
- Maintain consistent layout

**Recommendation**: Maintain consistent navigation
**Library**: WCAG 2.1 - Consistent Navigation

**Applies to**: All frameworks


**Source**: `src/rules/data/accessibility.json`

---

### A11Y_ERROR_PREVENTION: No error prevention for forms

**Severity**: MEDIUM | **Category**: accessibility

Provide confirmation for important actions and reversible submissions.

**What it catches:**
- No confirmation for important actions
- Users can't reverse submissions
- WCAG error prevention violation

**How to fix:**
- Add confirmation dialogs for important actions
- Provide reversible submission options
- Allow undo functionality

**Recommendation**: Add error prevention
**Library**: WCAG 2.1 - Error Prevention

**Applies to**: All frameworks


**Source**: `src/rules/data/accessibility.json`

---

### A11Y_ERROR_SUGGESTION: No error suggestions provided

**Severity**: MEDIUM | **Category**: accessibility

When errors are detected, suggest corrections.

**What it catches:**
- No error suggestions
- Users don't know how to fix errors
- WCAG error suggestion violation

**How to fix:**
- Suggest corrections for errors
- Provide format examples
- Validate in real-time

**Recommendation**: Provide error suggestions
**Library**: WCAG 2.1 - Error Suggestion

**Applies to**: All frameworks


**Source**: `src/rules/data/accessibility.json`

---

### A11Y_ERROR_UNCLEAR: Unclear error messages

**Severity**: HIGH | **Category**: accessibility

Error messages should clearly explain what went wrong.

**What it catches:**
- Error messages not descriptive
- Users don't know how to fix errors
- WCAG 2.1 A1 violation

**How to fix:**
- Write clear, specific error messages
- Explain what went wrong and how to fix it
- Use plain language

**Recommendation**: Make error messages clear
**Library**: WCAG 2.1 A1

**Applies to**: react, vue, nextjs, nuxt, astro, svelte, angular


**Source**: `src/rules/data/accessibility.json`

---

### A11Y_FOCUS_ORDER: Focus order not logical

**Severity**: HIGH | **Category**: accessibility

Tab order should follow visual layout from left to right, top to bottom.

**What it catches:**
- Focus order doesn't follow visual layout
- Confusing navigation for keyboard users
- WCAG focus order violation

**How to fix:**
- Order elements in DOM logically
- Use tabindex carefully
- Test with keyboard navigation

**Recommendation**: Ensure logical focus order
**Library**: WCAG 2.1 - Focus Order

**Applies to**: All frameworks


**Source**: `src/rules/data/accessibility.json`

---

### A11Y_FOCUS_VISIBLE: Focus not visible

**Severity**: CRITICAL | **Category**: accessibility

Keyboard focus must have visible indicator at all times.

**What it catches:**
- Focus indicator not visible
- Keyboard users lose track of focus
- WCAG focus visible violation

**How to fix:**
- Ensure focus is always visible
- Don't hide focus with CSS
- Use high contrast focus styles

**Recommendation**: Make focus clearly visible
**Library**: WCAG 2.1 - Focus Visible

**Applies to**: All frameworks


**Source**: `src/rules/data/accessibility.json`

---

### A11Y_HELP_DOCS: Missing help or instructions

**Severity**: LOW | **Category**: accessibility

Provide help text and clear instructions for complex forms.

**What it catches:**
- No help text for complex forms
- Users don't understand required input
- WCAG input assistance violation

**How to fix:**
- Add help text for complex fields
- Provide clear instructions
- Show examples where helpful

**Recommendation**: Add help and instructions
**Library**: WCAG 2.1 - Input Assistance

**Applies to**: All frameworks


**Source**: `src/rules/data/accessibility.json`

---

### A11Y_LANDMARKS: Missing semantic landmarks

**Severity**: MEDIUM | **Category**: accessibility

Use <header>, <nav>, <main>, <footer> for screen reader navigation.

**What it catches:**
- Missing semantic HTML landmarks
- Screen readers can't navigate regions
- WCAG info and relationships violation

**How to fix:**
- Add header, nav, main, footer elements
- Use aside for complementary content
- Use role attributes as fallback

**Recommendation**: Use semantic HTML landmarks
**Library**: WCAG 2.1 - Info and Relationships

**Applies to**: All frameworks


**Source**: `src/rules/data/accessibility.json`

---

### A11Y_LINK_PURPOSE: Link purpose not clear from context

**Severity**: MEDIUM | **Category**: accessibility

Link purpose should be clear from link text alone or context.

**What it catches:**
- Link purpose unclear from context
- Users can't determine destination
- WCAG link purpose violation

**How to fix:**
- Make link text descriptive
- Add aria-label for context
- Avoid ambiguous link text

**Recommendation**: Clear link purpose
**Library**: WCAG 2.1 - Link Purpose

**Applies to**: All frameworks


**Source**: `src/rules/data/accessibility.json`

---

### A11Y_MULTIPLE_WAYS: Only one way to find page

**Severity**: LOW | **Category**: accessibility

Users should have multiple ways to find pages (search, navigation, site map).

**What it catches:**
- Only one way to find pages
- Users with disabilities limited
- WCAG multiple ways violation

**How to fix:**
- Add site search functionality
- Include site map
- Use navigation menus

**Recommendation**: Provide multiple ways to find pages
**Library**: WCAG 2.1 - Multiple Ways

**Applies to**: All frameworks


**Source**: `src/rules/data/accessibility.json`

---

### A11Y_NO_REFERRER: Link behavior changes context unexpectedly

**Severity**: HIGH | **Category**: accessibility

Links should not open new windows/tabs without warning.

**What it catches:**
- Links open new windows without warning
- Context changes unexpectedly on focus
- WCAG on focus violation

**How to fix:**
- Warn before opening new window
- Use rel="noopener noreferrer"
- Announce link behavior to screen readers

**Recommendation**: Don't change context unexpectedly
**Library**: WCAG 2.1 - On Focus

**Applies to**: All frameworks


**Source**: `src/rules/data/accessibility.json`

---

### A11Y_PAGE_TITLE: Missing or unclear page title

**Severity**: HIGH | **Category**: accessibility

Each page should have a unique, descriptive title.

**What it catches:**
- Missing or generic page title
- Users can't identify pages
- WCAG page titled violation

**How to fix:**
- Add unique title to each page
- Include page name and site name
- Make titles descriptive

**Recommendation**: Add descriptive page titles
**Library**: WCAG 2.1 - Page Titled

**Applies to**: All frameworks


**Source**: `src/rules/data/accessibility.json`

---

### A11Y_PREDICTABLE: Unpredictable behavior on focus/hover

**Severity**: HIGH | **Category**: accessibility

Focus and hover should not cause unexpected content changes.

**What it catches:**
- Focus/hover causes unexpected changes
- Content changes without user action
- WCAG predictability violation

**How to fix:**
- Don't change content on focus/hover alone
- Use user-triggered events
- Provide controls for dynamic content

**Recommendation**: Make behavior predictable
**Library**: WCAG 2.1 - Predictable

**Applies to**: All frameworks


**Source**: `src/rules/data/accessibility.json`

---

### A11Y_REDUCED_MOTION: Missing reduced motion preference

**Severity**: MEDIUM | **Category**: accessibility

Add media query for prefers-reduced-motion.

**What it catches:**
- Animations play for users who prefer reduced motion
- Can cause dizziness or nausea
- WCAG 2.1 A2 violation

**How to fix:**
- Add prefers-reduced-motion media query
- Disable or reduce animations for users who prefer it

**Recommendation**: Respect reduced motion preference
**Library**: WCAG 2.1 A2

**Applies to**: react, vue, nextjs, nuxt, astro, svelte, angular


**Source**: `src/rules/data/accessibility.json`

---

### A11Y_STATUS_MESSAGE: Status messages not announced

**Severity**: MEDIUM | **Category**: accessibility

Status messages should be announced without focus change using aria-live.

**What it catches:**
- Status messages not announced
- Screen readers miss important updates
- WCAG status messages violation

**How to fix:**
- Add aria-live to status regions
- Announce important updates
- Don't steal focus for status

**Recommendation**: Announce status messages
**Library**: WCAG 2.1 - Status Messages

**Applies to**: All frameworks


**Source**: `src/rules/data/accessibility.json`

---

### A11Y_TIMEOUT_SHORT: Short timeout without warning

**Severity**: HIGH | **Category**: accessibility

Sessions with short timeouts should warn users.

**What it catches:**
- Users timed out without warning
- Data loss from expired sessions
- WCAG 2.1 A1 violation

**How to fix:**
- Warn users before timeout
- Provide ways to extend session
- Allow users to adjust timeout settings

**Recommendation**: Warn users of short timeouts
**Library**: WCAG 2.1 A1

**Applies to**: react, vue, nextjs, nuxt, astro, svelte, angular


**Source**: `src/rules/data/accessibility.json`

---

### ACCESS_ARIA_LABEL: Missing ARIA labels

**Severity**: HIGH | **Category**: accessibility

Buttons and links need accessible names. Use aria-label or aria-labelledby.

**What it catches:**
- Buttons/links without accessible names
- Screen readers can't describe elements
- WCAG 2.1 A4 violation

**How to fix:**
- Add aria-label to interactive elements
- Use aria-labelledby for complex labels
- Ensure icon buttons have labels

**Recommendation**: Add ARIA labels to interactive elements
**Library**: WCAG 2.1 A4

**Applies to**: react, vue, nextjs, nuxt, astro, svelte, angular


**Source**: `src/rules/data/accessibility.json`

---

### ACCESS_COLOR_CONTRAST: Potential color contrast issue

**Severity**: MEDIUM | **Category**: accessibility

Text should have 4.5:1 contrast ratio against background.

**What it catches:**
- Insufficient color contrast
- Text hard to read for visually impaired users
- WCAG 2.1 AA1 violation

**How to fix:**
- Ensure 4.5:1 contrast ratio for normal text
- Ensure 3:1 for large text
- Use contrast checker tools

**Recommendation**: Ensure sufficient color contrast
**Library**: WCAG 2.1 AA1

**Applies to**: react, vue, nextjs, nuxt, astro, svelte, angular


**Source**: `src/rules/data/accessibility.json`

---

### ACCESS_DRAG_ALT: Drag operation without keyboard alternative

**Severity**: HIGH | **Category**: accessibility

Drag operations must have a keyboard alternative (click + move, or two clicks). Users cannot use drag with keyboards or assistive tech.

**What it catches:**
- Drag operations without keyboard alternative
- Users can't perform with keyboard
- WCAG 2.2 dragging movements violation

**How to fix:**
- Add keyboard alternative
- Use click + move pattern
- Provide two-click alternative

**Recommendation**: Provide keyboard alternative for drag
**Library**: WCAG 2.2 - Dragging Movements

**Applies to**: All frameworks
**File Extensions**: .tsx, .jsx, .vue, .svelte, .html

**Source**: `src/rules/data/accessibility.json`

---

### ACCESS_FOCUS_INDICATOR: Missing focus indicators

**Severity**: HIGH | **Category**: accessibility

Interactive elements need visible focus indicators for keyboard users.

**What it catches:**
- Focus indicator removed or hidden
- Keyboard users can't see focused element
- WCAG 2.1 AA2 violation

**How to fix:**
- Ensure focus indicators are visible
- Don't remove outline without replacement
- Use visible focus styles

**Recommendation**: Add focus indicators
**Library**: WCAG 2.1 AA2

**Applies to**: All frameworks


**Source**: `src/rules/data/accessibility.json`

---

### ACCESS_FOCUS_NOT_OBSCURED: Focus indicator hidden

**Severity**: HIGH | **Category**: accessibility

When an element receives focus, it must not be completely hidden by other content (sticky headers, modals, etc.).

**What it catches:**
- Focus hidden by other content
- Sticky headers cover focused element
- WCAG 2.2 focus not obscured violation

**How to fix:**
- Ensure focus never hidden
- Adjust sticky header behavior
- Scroll element into view

**Recommendation**: Focus must not be hidden
**Library**: WCAG 2.2 - Focus Not Obscured

**Applies to**: All frameworks
**File Extensions**: .css, .scss, .less, .html

**Source**: `src/rules/data/accessibility.json`

---

### ACCESS_FORM_LABEL: Form input missing label

**Severity**: HIGH | **Category**: accessibility

Form inputs need associated labels for screen readers.

**What it catches:**
- Form input missing label
- Screen readers can't identify field purpose
- WCAG 2.1 A1 violation

**How to fix:**
- Add <label> element for each input
- Use for attribute to associate label
- Use aria-label as fallback

**Recommendation**: Add labels to form inputs
**Library**: WCAG 2.1 A1

**Applies to**: All frameworks


**Source**: `src/rules/data/accessibility.json`

---

### ACCESS_HEADING_ORDER: Heading level skipped

**Severity**: MEDIUM | **Category**: accessibility

Heading levels should not skip (e.g., h1 to h3 without h2).

**What it catches:**
- Heading levels skipped (e.g., h1 to h3)
- Screen reader users can't navigate structure
- WCAG 2.1 A1 violation

**How to fix:**
- Use sequential heading levels
- Don't skip from h1 to h3 without h2
- Use proper hierarchy for outline

**Recommendation**: Maintain proper heading hierarchy
**Library**: WCAG 2.1 A1

**Applies to**: react, vue, nextjs, nuxt, astro, svelte, angular


**Source**: `src/rules/data/accessibility.json`

---

### ACCESS_IMG_ALT: Image missing alt text

**Severity**: HIGH | **Category**: accessibility

Images need alt text for screen readers. Use empty alt="" for decorative images.

**What it catches:**
- Image missing alt attribute
- Screen readers can't describe images
- WCAG 2.1 A1 violation

**How to fix:**
- Add alt text to all images
- Use alt="" for decorative images
- Describe image content in alt text

**Recommendation**: Add alt text to images
**Library**: WCAG 2.1 A1

**Applies to**: react, vue, nextjs, nuxt, astro, svelte, angular


**Source**: `src/rules/data/accessibility.json`

---

### ACCESS_KBD_NAV: Keyboard navigation issues

**Severity**: HIGH | **Category**: accessibility

All interactive elements must be keyboard accessible.

**What it catches:**
- Interactive elements not keyboard accessible
- Users can't navigate with Tab key
- WCAG 2.1 A2 violation

**How to fix:**
- Ensure all buttons/links are focusable
- Add keyboard event handlers
- Test with keyboard only navigation

**Recommendation**: Ensure keyboard accessibility
**Library**: WCAG 2.1 A2

**Applies to**: react, vue, nextjs, nuxt, astro, svelte, angular


**Source**: `src/rules/data/accessibility.json`

---

### ACCESS_LANG_ATTRIBUTE: Missing lang attribute

**Severity**: MEDIUM | **Category**: accessibility

Add lang attribute to the html element for screen readers.

**What it catches:**
- Missing lang attribute on HTML element
- Screen readers can't pronounce content correctly
- WCAG 2.1 A3 violation

**How to fix:**
- Add lang attribute to <html> tag (e.g., lang="en")
- Use appropriate language code for the content

**Recommendation**: Add lang attribute to HTML
**Library**: WCAG 2.1 A3

**Applies to**: react, vue, nextjs, nuxt, astro, svelte, angular


**Source**: `src/rules/data/accessibility.json`

---

### ACCESS_LINK_TEXT: Insufficient link text

**Severity**: MEDIUM | **Category**: accessibility

Links should describe their destination. Avoid "click here" or "read more".

**What it catches:**
- Link text not descriptive (e.g., click here)
- Users can't determine link destination
- WCAG 2.1 A13 violation

**How to fix:**
- Use descriptive link text
- Avoid generic phrases like click here
- Make link purpose clear

**Recommendation**: Use descriptive link text
**Library**: WCAG 2.1 A13

**Applies to**: All frameworks


**Source**: `src/rules/data/accessibility.json`

---

### ACCESS_LIVE_REGION: Missing live region for dynamic content

**Severity**: MEDIUM | **Category**: accessibility

Use aria-live for content that updates dynamically.

**What it catches:**
- Dynamic content updates not announced
- Screen reader users miss updates
- WCAG 2.1 A1 violation

**How to fix:**
- Add aria-live attribute to dynamic content regions
- Use polite or assertive based on urgency

**Recommendation**: Add live regions for dynamic content
**Library**: WCAG 2.1 A1

**Applies to**: react, vue, nextjs, nuxt, astro, svelte, angular


**Source**: `src/rules/data/accessibility.json`

---

### ACCESS_SKIP_LINK: Missing skip link

**Severity**: HIGH | **Category**: accessibility

Add a skip link to allow keyboard users to bypass navigation.

**What it catches:**
- No skip navigation link
- Keyboard users can't bypass navigation
- WCAG 2.1 B1 violation

**How to fix:**
- Add a skip link at the top of the page
- Make it visible on focus
- Link to the main content area

**Recommendation**: Add skip navigation link
**Library**: WCAG 2.1 B1

**Applies to**: react, vue, nextjs, nuxt, astro, svelte, angular
**File Extensions**: .html, .tsx, .jsx, .vue, .svelte, .astro

**Source**: `src/rules/data/accessibility.json`

---

### ACCESS_TARGET_SIZE: Clickable target too small

**Severity**: HIGH | **Category**: accessibility

Clickable targets must be at least 24 by 24 CSS pixels. Small targets are difficult for users with motor impairments.

**What it catches:**
- Clickable targets too small
- Users with motor impairments struggle
- WCAG 2.2 target size violation

**How to fix:**
- Make targets at least 24x24px
- Increase padding on buttons
- Use touch-friendly sizes

**Recommendation**: Use minimum 24x24px target size
**Library**: WCAG 2.2 - Target Size (Minimum)

**Applies to**: All frameworks
**File Extensions**: .css, .scss, .less, .html, .tsx, .jsx, .vue, .svelte

**Source**: `src/rules/data/accessibility.json`

---

### ACCESS_TEXT_SPACING: Text spacing restrictions

**Severity**: MEDIUM | **Category**: accessibility

Text should reflow when users adjust line-height, letter-spacing, or word-spacing. Avoid fixed px line-heights.

**What it catches:**
- Fixed text spacing prevents adjustment
- Users can't customize reading experience
- WCAG 2.2 text spacing violation

**How to fix:**
- Use unitless line-height
- Avoid fixed px line-heights
- Allow natural text reflow

**Recommendation**: Allow text spacing adjustments
**Library**: WCAG 2.2 - Text Spacing

**Applies to**: All frameworks
**File Extensions**: .css, .scss, .less

**Source**: `src/rules/data/accessibility.json`

---

### ACCESS_WRAP_LINES: Horizontal scrolling required

**Severity**: HIGH | **Category**: accessibility

Content should not require horizontal scrolling at 320px width. Use word-wrap, overflow-wrap, or allow natural text reflow.

**What it catches:**
- Horizontal scrolling at 320px
- Content doesn't wrap properly
- WCAG 2.2 wrap lines violation

**How to fix:**
- Enable text wrapping
- Use word-wrap or overflow-wrap
- Test at 320px width

**Recommendation**: Enable line wrapping
**Library**: WCAG 2.2 - Wrap Lines

**Applies to**: All frameworks
**File Extensions**: .css, .scss, .less

**Source**: `src/rules/data/accessibility.json`

---

### MOBILE_TAP_SIZE: Touch targets too small

**Severity**: MEDIUM | **Category**: accessibility

Touch targets should be at least 44x44 pixels for accessibility.

**What it catches:**
- Hard to tap small buttons
- Accessibility violations
- User frustration

**How to fix:**
- Increase button size to 44x44px minimum
- Add adequate padding
- Test touch targets on actual devices

**Recommendation**: Increase touch target size
**Library**: CSS

**Applies to**: All frameworks


**Source**: `src/rules/data/mobile.json`

---

## Api

### API_NO_DEPRECATION: Missing deprecation header for old endpoints

**Severity**: MEDIUM | **Category**: api

Deprecated endpoints should include Deprecation and Sunset headers.

**What it catches:**
- No deprecation headers
- Clients don't know endpoint is deprecated
- Breaking changes surprise users

**How to fix:**
- Add Deprecation header
- Add Sunset header
- Document deprecation timeline

**Recommendation**: Add deprecation headers
**Library**: API versioning

**Applies to**: express, fastify, nextjs, nuxt
**File Extensions**: .ts, .js

**Source**: `src/rules/data/api.json`

---

### API_NO_ERROR_TYPE: API missing error type

**Severity**: MEDIUM | **Category**: api

API should return typed error responses for proper error handling.

**What it catches:**
- No typed error responses
- Clients can't handle errors properly
- Inconsistent error format

**How to fix:**
- Define error response types
- Use error handling middleware
- Return consistent error format

**Recommendation**: Add typed error responses
**Library**: TypeScript

**Applies to**: express, fastify, nextjs, nuxt
**File Extensions**: .ts, .js

**Source**: `src/rules/data/api.json`

---

### API_NO_ETAG: Missing ETag for caching

**Severity**: LOW | **Category**: api

Add ETag headers to enable conditional requests and caching.

**What it catches:**
- No ETag headers
- No conditional request support
- Wasted bandwidth

**How to fix:**
- Add ETag headers
- Support if-none-match
- Use express-etag or similar

**Recommendation**: Add ETag for conditional requests
**Library**: Express: express-etag

**Applies to**: express, fastify, nextjs, nuxt
**File Extensions**: .ts, .js

**Source**: `src/rules/data/api.json`

---

### API_NO_IDEMPOTENCY: Missing idempotency for critical operations

**Severity**: MEDIUM | **Category**: api

POST/PUT/DELETE endpoints should support idempotency keys to prevent duplicate operations.

**What it catches:**
- No idempotency support
- Duplicate operations possible
- Payment issues

**How to fix:**
- Add idempotency key header
- Store key with result
- Check before processing

**Recommendation**: Add idempotency keys
**Library**: Idempotency

**Applies to**: express, fastify, nextjs, nuxt
**File Extensions**: .ts, .js

**Source**: `src/rules/data/api.json`

---

### API_NO_PAGINATION: API missing pagination

**Severity**: MEDIUM | **Category**: api

Large data sets should be paginated.

**What it catches:**
- No pagination on list endpoints
- Large data sets returned
- Performance issues

**How to fix:**
- Add page/limit parameters
- Implement cursor-based pagination
- Set reasonable defaults

**Recommendation**: Add pagination to list endpoints
**Library**: API design

**Applies to**: express, fastify, nextjs, nuxt
**File Extensions**: .ts, .js

**Source**: `src/rules/data/api.json`

---

### API_NO_RATE_LIMIT: API missing rate limiting

**Severity**: MEDIUM | **Category**: api

APIs should have rate limiting to prevent abuse.

**What it catches:**
- No rate limiting
- Vulnerable to abuse
- DDoS vulnerability

**How to fix:**
- Add rate limiting middleware
- Configure limits per endpoint
- Use Redis for distributed rate limiting

**Recommendation**: Add rate limiting
**Library**: API security

**Applies to**: express, fastify
**File Extensions**: .ts, .js

**Source**: `src/rules/data/api.json`

---

### API_NO_REQUEST_ID: Missing request ID for tracing

**Severity**: LOW | **Category**: api

Add X-Request-ID or correlation ID for request tracing.

**What it catches:**
- No request ID for tracing
- Hard to debug issues
- No correlation across services

**How to fix:**
- Add X-Request-ID header
- Pass request ID to logs
- Use OpenTelemetry

**Recommendation**: Add request ID headers
**Library**: Express: uuid, Morgan

**Applies to**: express, fastify, nextjs, nuxt
**File Extensions**: .ts, .js

**Source**: `src/rules/data/api.json`

---

### API_PUBLIC_CALLS_PRIVATE: Public API directly calls private/internal API

**Severity**: LOW | **Category**: api

Public APIs should go through an API gateway rather than directly calling internal services.

**What it catches:**
- Public API calls internal services
- No API Gateway
- Direct service-to-service calls

**How to fix:**
- Use API Gateway
- Implement BFF pattern
- Hide internal services

**Recommendation**: Use API Gateway pattern
**Library**: API Gateway, BFF pattern

**Applies to**: All frameworks
**File Extensions**: .ts, .js

**Source**: `src/rules/data/api.json`

---

## Api-versioning

### API_VERSION_DEPRECATED: Old API version not deprecated

**Severity**: MEDIUM | **Category**: api-versioning

Mark deprecated versions with Sunset header and documentation.

**What it catches:**
- Old API versions not deprecated
- Clients don't know to migrate
- Long-term maintenance burden

**How to fix:**
- Add Sunset header
- Document deprecation timeline
- Provide migration guide

**Recommendation**: Deprecate old versions
**Library**: API versioning

**Applies to**: All frameworks
**File Extensions**: ts, js, yaml, yml

**Source**: `src/rules/data/api-versioning.json`

---

### API_VERSION_HEADER: Using header versioning only

**Severity**: LOW | **Category**: api-versioning

Header versioning is harder to discover and test.

**What it catches:**
- Header-based versioning only
- Harder to discover and test
- Less visible to consumers

**How to fix:**
- Use URL versioning (/v1/)
- Use header as secondary
- Document versioning approach

**Recommendation**: Prefer URL versioning
**Library**: API versioning

**Applies to**: All frameworks
**File Extensions**: ts, js

**Source**: `src/rules/data/api-versioning.json`

---

### API_VERSION_LATEST: No /latest endpoint versioning

**Severity**: LOW | **Category**: api-versioning

Latest alias makes testing and migration easier.

**What it catches:**
- No /latest alias
- Harder to test latest version
- Migration more difficult

**How to fix:**
- Add /latest or /current endpoint
- Point to latest stable version
- Document alias usage

**Recommendation**: Support /latest for easier testing
**Library**: API versioning

**Applies to**: All frameworks
**File Extensions**: ts, js

**Source**: `src/rules/data/api-versioning.json`

---

### API_VERSION_MISSING: API missing version in URL

**Severity**: MEDIUM | **Category**: api-versioning

Include version in URL (e.g., /v1/users) for backward compatibility.

**What it catches:**
- API endpoints without version in URL
- Breaking changes affect all clients
- No backward compatibility

**How to fix:**
- Add version to URL (e.g., /v1/users)
- Plan versioning strategy
- Document version lifecycle

**Recommendation**: Version APIs in URL
**Library**: API versioning

**Applies to**: express, fastify, nextjs, nuxt
**File Extensions**: ts, js

**Source**: `src/rules/data/api-versioning.json`

---

### API_VERSION_NO_CHANGE_LOG: Missing changelog for API versions

**Severity**: LOW | **Category**: api-versioning

Document breaking changes between versions.

**What it catches:**
- No changelog for API versions
- Clients can't see changes
- Difficult to migrate

**How to fix:**
- Maintain version changelog
- Document breaking changes
- Provide migration notes

**Recommendation**: Maintain changelog
**Library**: API documentation

**Applies to**: All frameworks
**File Extensions**: md, ts, js

**Source**: `src/rules/data/api-versioning.json`

---

## Architecture

### AI_EFFECT_SPAGHETTI: useEffect with data fetching without caching

**Severity**: MEDIUM | **Category**: architecture

useEffect with data fetching should be replaced with TanStack Query for better caching, error handling, and loading states.

**What it catches:**
- Data fetching in useEffect without caching
- No loading/error states
- Refetching on every render

**How to fix:**
- Use TanStack Query for data fetching
- Add caching and deduplication
- Handle loading/error states

**Recommendation**: Use TanStack Query for data fetching
**Library**: @tanstack/react-query

**Applies to**: react, nextjs


**Source**: `src/rules/data/ai-patterns.json`

---

### AI_GENERIC_ERROR: Generic try/catch with Something went wrong

**Severity**: MEDIUM | **Category**: architecture

Generic try/catch with Something went wrong message. Add specific error handling.

**What it catches:**
- Generic error messages
- No specific error handling
- Users don't know what went wrong

**How to fix:**
- Add specific error types
- Show actionable error messages
- Handle different error cases

**Recommendation**: Add specific error handling
**Library**: Custom error types

**Applies to**: All frameworks


**Source**: `src/rules/data/ai-patterns.json`

---

### AI_GENERIC_TOAST: Multiple console.log without context

**Severity**: INFO | **Category**: architecture

Multiple console.log statements without context. Use structured logging with appropriate log levels.

**What it catches:**
- Multiple console.log without context
- Hard to debug in production
- No structured logging

**How to fix:**
- Use structured logging library
- Add log levels (info, warn, error)
- Include context in logs

**Recommendation**: Add context to console.log statements
**Library**: pino, winston

**Applies to**: All frameworks


**Source**: `src/rules/data/ai-patterns.json`

---

### AI_PROP_DRILLING: Props passed through 3+ levels

**Severity**: MEDIUM | **Category**: architecture

Props passed through 3+ levels. Consider React Context or component composition.

**What it catches:**
- Props passed through 3+ levels
- Unnecessary prop passing
- Hard to maintain components

**How to fix:**
- Use React Context
- Use component composition
- Break up large components

**Recommendation**: Use context or composition to avoid prop drilling
**Library**: React Context

**Applies to**: react, nextjs


**Source**: `src/rules/data/ai-patterns.json`

---

### ANGULAR_SUBSCRIBE_LEAK: Subscription without unsubscribe

**Severity**: CRITICAL | **Category**: architecture

Always unsubscribe from observables to prevent memory leaks. Use takeUntilDestroyed or unsubscribe.

**What it catches:**
- Observable subscription without unsubscribe
- Memory leaks
- Performance degradation

**How to fix:**
- Use takeUntilDestroyed()
- Unsubscribe in ngOnDestroy
- Use async pipe instead

**Recommendation**: Unsubscribe from observables
**Library**: RxJS

**Applies to**: angular


**Source**: `src/rules/data/angular.json`

---

### ARCH_ANEMIC_MODEL: Anemic domain model

**Severity**: MEDIUM | **Category**: architecture

Classes with only getters/setters are anemic. Add domain logic to models.

**What it catches:**
- Classes with only getters/setters
- No business logic in models
- Anemic domain model

**How to fix:**
- Add domain logic to models
- Use domain-driven design
- Move logic from services

**Recommendation**: Add behavior to domain models
**Library**: Domain-Driven Design

**Applies to**: All frameworks
**File Extensions**: .ts, .js

**Source**: `src/rules/data/architecture.json`

---

### ARCH_BIG_COMPONENT: Component too large

**Severity**: MEDIUM | **Category**: architecture

Components should be focused. Split into smaller, composable components.

**What it catches:**
- Component too large
- Hard to maintain
- Multiple responsibilities

**How to fix:**
- Split into smaller components
- Extract sub-components
- Use composition

**Recommendation**: Split large components
**Library**: Component Design

**Applies to**: react, vue, svelte, angular
**File Extensions**: .tsx, .jsx, .vue, .svelte

**Source**: `src/rules/data/architecture.json`

---

### ARCH_CIRCULAR_DEP: Circular dependency detected

**Severity**: HIGH | **Category**: architecture

Circular dependencies cause tight coupling and make testing difficult. Refactor to use dependency injection.

**What it catches:**
- Circular dependencies
- Tight coupling
- Testing difficulties

**How to fix:**
- Use dependency injection
- Extract shared logic
- Refactor to reduce coupling

**Recommendation**: Break circular dependencies
**Library**: Architecture

**Applies to**: All frameworks
**File Extensions**: .ts, .js

**Source**: `src/rules/data/architecture.json`

---

### ARCH_DB_IN_CONTROLLER: Database access in controller

**Severity**: HIGH | **Category**: architecture

Controllers should only handle HTTP concerns. Move database logic to repositories/services.

**What it catches:**
- Database logic in controller
- Poor separation of concerns
- Hard to test

**How to fix:**
- Move DB logic to service/repository
- Keep controllers thin
- Separate HTTP and data concerns

**Recommendation**: Move database logic to service layer
**Library**: Layered Architecture

**Applies to**: express, fastify, nodejs


**Source**: `src/rules/data/architecture.json`

---

### ARCH_DIRECT_SQL: Raw SQL in route handlers

**Severity**: MEDIUM | **Category**: architecture

Raw SQL in routes couples to database. Use repository pattern.

**What it catches:**
- Raw SQL in routes
- Database coupling
- Hard to maintain

**How to fix:**
- Use repository pattern
- Move SQL to repositories
- Abstract database access

**Recommendation**: Use repository pattern
**Library**: Repository Pattern

**Applies to**: All frameworks
**File Extensions**: .ts, .js

**Source**: `src/rules/data/architecture.json`

---

### ARCH_FEATURE_ENVY: Feature envy anti-pattern

**Severity**: LOW | **Category**: architecture

Methods that access too much data from other classes should be moved there.

**What it catches:**
- Method accesses too much from other class
- Feature envy code smell
- Poor encapsulation

**How to fix:**
- Move method to data class
- Extract related logic
- Improve encapsulation

**Recommendation**: Move method to data class
**Library**: Refactoring

**Applies to**: All frameworks


**Source**: `src/rules/data/architecture.json`

---

### ARCH_GOD_CLASS: God class detected

**Severity**: HIGH | **Category**: architecture

Classes that do too much should be split into focused, single-responsibility classes.

**What it catches:**
- Class does too much
- Violates single responsibility
- Hard to maintain

**How to fix:**
- Split into smaller classes
- Apply single responsibility
- Extract related functionality

**Recommendation**: Split god class
**Library**: SOLID - SRP

**Applies to**: All frameworks
**File Extensions**: .ts, .js

**Source**: `src/rules/data/architecture.json`

---

### ARCH_HUB_MODULE: Hub module with too many dependencies

**Severity**: MEDIUM | **Category**: architecture

Modules that depend on too many other modules indicate poor separation. Split into smaller modules.

**What it catches:**
- Module depends on many others
- Poor separation of concerns
- Hard to maintain

**How to fix:**
- Split into smaller modules
- Extract related functionality
- Reduce dependencies

**Recommendation**: Split hub modules
**Library**: Architecture

**Applies to**: All frameworks


**Source**: `src/rules/data/architecture.json`

---

### ARCH_LOGIC_IN_ROUTE: Business logic in route handler

**Severity**: MEDIUM | **Category**: architecture

Route handlers should delegate to service layer. Keep them thin.

**What it catches:**
- Business logic in routes
- Hard to test and reuse
- Duplicated logic

**How to fix:**
- Extract to service layer
- Keep routes thin
- Delegate to business logic

**Recommendation**: Extract business logic
**Library**: Service Layer

**Applies to**: express, fastify


**Source**: `src/rules/data/architecture.json`

---

### ARCH_NO_ABSTRACTION: Missing abstraction layer

**Severity**: MEDIUM | **Category**: architecture

Direct implementations scattered throughout code. Use abstractions/interfaces.

**What it catches:**
- Direct implementations everywhere
- No abstractions/interfaces
- Tight coupling

**How to fix:**
- Add interfaces
- Use dependency injection
- Abstract implementations

**Recommendation**: Add abstraction layers
**Library**: Dependency Inversion

**Applies to**: All frameworks
**File Extensions**: .ts, .d.ts

**Source**: `src/rules/data/architecture.json`

---

### ARCH_NO_SERVICE_LAYER: Missing service layer

**Severity**: MEDIUM | **Category**: architecture

Business logic should be in a service layer, not in routes or controllers.

**What it catches:**
- No service layer
- Logic in routes/controllers
- Poor separation

**How to fix:**
- Create service layer
- Move business logic
- Keep routes thin

**Recommendation**: Add service layer
**Library**: Layered Architecture

**Applies to**: All frameworks


**Source**: `src/rules/data/architecture.json`

---

### ARCH_ORPHAN_MODULE: Orphan/unused module

**Severity**: LOW | **Category**: architecture

Modules with no dependencies may be dead code. Verify and remove.

**What it catches:**
- Orphan module with no dependencies
- May be dead code
- Unnecessary bundle size

**How to fix:**
- Verify if module is used
- Remove dead code
- Add exports if needed

**Recommendation**: Remove orphan modules
**Library**: Architecture

**Applies to**: All frameworks


**Source**: `src/rules/data/architecture.json`

---

### ARCH_PROP_DRILLING: Props drilling through many levels

**Severity**: MEDIUM | **Category**: architecture

Props passed through 3+ levels indicate need for context or state management.

**What it catches:**
- Props passed through many levels
- Prop drilling code smell
- Hard to maintain

**How to fix:**
- Use React Context
- Use state management
- Use composition

**Recommendation**: Use context or state management
**Library**: React Context, Vue/Nuxt Store

**Applies to**: react, vue, svelte
**File Extensions**: .tsx, .jsx, .vue, .svelte, .ts

**Source**: `src/rules/data/architecture.json`

---

### ARCH_SPAGHETTI_CODE: Spaghetti code structure

**Severity**: INFO | **Category**: architecture

Deeply nested, tangled code is hard to maintain. Refactor to clear structure.

**What it catches:**
- Deeply nested code
- Tangled control flow
- Hard to maintain

**How to fix:**
- Refactor to clean structure
- Reduce nesting
- Use early returns

**Recommendation**: Refactor to clean structure
**Library**: Clean Code

**Applies to**: All frameworks


**Source**: `src/rules/data/architecture.json`

---

### ARCH_VIOLATES_DEMETER: Law of Demeter violation

**Severity**: LOW | **Category**: architecture

Excessive chaining (a.getB().getC().getD()) violates Demeter. Use delegates.

**What it catches:**
- Excessive method chaining
- Law of Demeter violation
- Tight coupling

**How to fix:**
- Use delegate methods
- Reduce chaining
- Improve encapsulation

**Recommendation**: Avoid method chaining
**Library**: Law of Demeter

**Applies to**: All frameworks


**Source**: `src/rules/data/architecture.json`

---

### COMP_CIRCULAR: Potential circular dependency

**Severity**: MEDIUM | **Category**: architecture

Circular dependencies cause coupling issues. Refactor to remove them.

**What it catches:**
- Circular dependency found
- Tight coupling
- Startup issues

**How to fix:**
- Refactor to remove circular deps
- Use dependency injection
- Extract to third module

**Recommendation**: Avoid circular dependencies
**Library**: Architecture

**Applies to**: nextjs, nuxt, remix, svelte, vue
**File Extensions**: .ts, .js

**Source**: `src/rules/data/complexity.json`

---

### COMP_GLOBAL_STATE: Global state detected

**Severity**: MEDIUM | **Category**: architecture

Global state causes unexpected side effects. Use dependency injection.

**What it catches:**
- Global state found
- Unexpected side effects
- Hard to test

**How to fix:**
- Use dependency injection
- Pass state explicitly
- Use context/state management

**Recommendation**: Avoid global state
**Library**: Best practices

**Applies to**: All frameworks
**File Extensions**: .ts, .js

**Source**: `src/rules/data/complexity.json`

---

### EXPRESS_ERROR_HANDLER: Missing error handler middleware

**Severity**: HIGH | **Category**: architecture

Express apps should have error handling middleware.

**What it catches:**
- No error handler middleware
- Unhandled errors crash app
- Poor error responses

**How to fix:**
- Add error handler middleware
- Handle async errors
- Return proper error responses

**Recommendation**: Add error handler middleware
**Library**: Express

**Applies to**: express


**Source**: `src/rules/data/express.json`

---

### EXPRESS_SYNC_ROUTE: Synchronous code in async route handler

**Severity**: HIGH | **Category**: architecture

Express route handlers should be async for proper error handling.

**What it catches:**
- Synchronous code in route handler
- Blocks event loop
- Poor performance

**How to fix:**
- Use async/await in routes
- Avoid sync operations
- Use worker threads if needed

**Recommendation**: Use async/await in route handlers
**Library**: Express

**Applies to**: express


**Source**: `src/rules/data/express.json`

---

### FASTIFY_ASYNC_ERROR: Async route without try-catch

**Severity**: HIGH | **Category**: architecture

Fastify route handlers should use async/await with proper error handling.

**What it catches:**
- Async route without try-catch
- Unhandled promise rejection
- Crashes on errors

**How to fix:**
- Add try-catch to async routes
- Use Fastify error handling
- Handle rejections properly

**Recommendation**: Use async/await properly
**Library**: Fastify

**Applies to**: fastify


**Source**: `src/rules/data/fastify.json`

---

### MVC_BUSINESS_IN_CONTROLLER: Business logic in controller

**Severity**: MEDIUM | **Category**: architecture

Controllers should handle HTTP, not business logic.

**What it catches:**
- Business logic mixed with HTTP handling
- Hard to test business logic
- Code duplication

**How to fix:**
- Extract logic to service layer
- Keep controllers thin
- Follow single responsibility

**Recommendation**: Move business logic to service layer
**Library**: MVC

**Applies to**: express, fastify


**Source**: `src/rules/data/mvc.json`

---

### MVC_FAT_MODEL: Fat model

**Severity**: LOW | **Category**: architecture

Models should be focused and not contain unrelated logic.

**What it catches:**
- Models too large
- Too many responsibilities
- Hard to maintain

**How to fix:**
- Split into multiple models
- Use composition over inheritance
- Extract to services

**Recommendation**: Split large models
**Library**: MVC

**Applies to**: All frameworks


**Source**: `src/rules/data/mvc.json`

---

### NEXT_PARALLEL_ROUTE_MISSING: Parallel route without default.tsx

**Severity**: MEDIUM | **Category**: architecture

Parallel routes need a default.tsx to handle unmatched slots.

**What it catches:**
- Blank page for unmatched routes
- User sees nothing when slot inactive
- Poor UX

**How to fix:**
- Add default.tsx for unmatched slots
- Create fallback UI
- Handle both matched and unmatched states

**Recommendation**: Add default component for parallel routes
**Library**: Next.js

**Applies to**: nextjs
**File Extensions**: .tsx, .jsx, .ts, .js

**Source**: `src/rules/data/nextjs.json`

---

### NEXT_SERVER_COMPONENT_CLIENT: useState/useEffect in Server Component

**Severity**: CRITICAL | **Category**: architecture

useState/useEffect can only be used in Client Components. Add 'use client' or refactor.

**What it catches:**
- Using hooks in Server Component
- Runtime errors in SSR
- Breaking Server Component functionality

**How to fix:**
- Add 'use client' at top of component
- Extract client logic to separate component
- Pass data from server to client

**Recommendation**: Move client code to client component
**Library**: Next.js

**Applies to**: nextjs


**Source**: `src/rules/data/nextjs.json`

---

### NEXT_SERVER_DIRECTIVE: Missing 'use server' for server actions

**Severity**: MEDIUM | **Category**: architecture

Server actions should be marked with 'use server' directive.

**What it catches:**
- Server actions not recognized
- Actions run on client instead of server
- Security issues

**How to fix:**
- Add 'use server' to action functions
- Place server actions in separate files
- Import actions from server files

**Recommendation**: Add 'use server' for server actions
**Library**: Next.js

**Applies to**: nextjs


**Source**: `src/rules/data/nextjs.json`

---

### NUXT_SERVER_ROUTE_SYNC: Sync code in server route

**Severity**: HIGH | **Category**: architecture

Server routes should use async/await for proper error handling.

**What it catches:**
- Blocking event loop
- Poor server performance
- Can't handle async operations

**How to fix:**
- Use async/await in defineEventHandler
- Return promises from handlers
- Handle errors with try-catch

**Recommendation**: Use async/await in server routes
**Library**: Nuxt

**Applies to**: nuxt


**Source**: `src/rules/data/nuxt.json`

---

### REACT_ASYNC_IN_RENDER: Async function in render

**Severity**: HIGH | **Category**: architecture

Async functions in render cause issues. Use useEffect for async operations.

**What it catches:**
- Async function defined in render
- setState called during render
- Violating React rendering rules

**How to fix:**
- Move async logic to useEffect
- Use event handlers for async actions
- Call setState in callbacks, not directly in render

**Recommendation**: Don't use async functions in render
**Library**: React

**Applies to**: react, nextjs


**Source**: `src/rules/data/react.json`

---

### REACT_CONTEXT_REWRITE: Mutating context value

**Severity**: MEDIUM | **Category**: architecture

Mutating context value directly breaks reactivity. Use setState.

**What it catches:**
- Mutating context value directly
- Breaking React reactivity
- Consumers not re-rendering

**How to fix:**
- Use setState to update context
- Use useReducer for complex updates
- Create update methods in context provider

**Recommendation**: Don't mutate context value
**Library**: React

**Applies to**: react, nextjs


**Source**: `src/rules/data/react.json`

---

### REACT_DIRECT_MANIPULATION: Direct DOM manipulation

**Severity**: MEDIUM | **Category**: architecture

Direct DOM manipulation bypasses React reconciliation. Use refs sparingly.

**What it catches:**
- Direct DOM access with getElementById
- Bypassing React reconciliation
- State/UI desync

**How to fix:**
- Use useRef for DOM access
- Use state for UI changes
- Let React handle DOM updates

**Recommendation**: Avoid direct DOM manipulation
**Library**: React

**Applies to**: react, nextjs


**Source**: `src/rules/data/react.json`

---

### REACT_DUPLICATE_KEY: Duplicate keys in lists

**Severity**: HIGH | **Category**: architecture

Duplicate keys cause incorrect rendering and reconciliation issues.

**What it catches:**
- Duplicate keys in list rendering
- Incorrect DOM updates
- Wrong item rendering

**How to fix:**
- Use unique IDs from data
- Generate IDs with a proper ID generator
- Avoid using array index as key

**Recommendation**: Fix duplicate keys in lists
**Library**: React

**Applies to**: react, nextjs
**File Extensions**: .jsx, .tsx

**Source**: `src/rules/data/react.json`

---

### REACT_FORWARD_REF_LEAK: forwardRef without useImperativeHandle

**Severity**: LOW | **Category**: architecture

forwardRef without useImperativeHandle can leak implementation details.

**What it catches:**
- Exposing internal ref to parent
- Leaking component implementation
- Breaking encapsulation

**How to fix:**
- Use useImperativeHandle to expose specific methods
- Limit what parent can access
- Consider not using ref at all

**Recommendation**: Use useImperativeHandle with forwardRef
**Library**: React

**Applies to**: react, nextjs


**Source**: `src/rules/data/react.json`

---

### REACT_HOOK_RULE_VIOLATION: Hooks called conditionally

**Severity**: CRITICAL | **Category**: architecture

React hooks must be called unconditionally at the top level of a component.

**What it catches:**
- Hooks called conditionally
- Violates Rules of Hooks
- Undefined behavior

**How to fix:**
- Move hooks to top level
- Don't call in conditions
- Follow Rules of Hooks

**Recommendation**: Move hooks outside conditionals
**Library**: React

**Applies to**: react, nextjs


**Source**: `src/rules/data/react.json`

---

### REACT_IMPURE_COMPONENT: Component with random values

**Severity**: HIGH | **Category**: architecture

Components with random values in render cause unnecessary re-renders and break reconciliation.

**What it catches:**
- Random values in component body
- Different render output each time
- Break React reconciliation

**How to fix:**
- Move random values to useMemo with dependencies
- Generate random values in parent and pass as props
- Use useEffect for initialization

**Recommendation**: Remove random values from render
**Library**: React

**Applies to**: react, nextjs


**Source**: `src/rules/data/react.json`

---

### REACT_INFINITE_LOOP: useEffect with empty deps + state

**Severity**: CRITICAL | **Category**: architecture

useEffect with empty deps array that updates state can cause infinite loop.

**What it catches:**
- Infinite loop in useEffect
- State updates on every render
- App freezes

**How to fix:**
- Add dependencies to deps array
- Use useMemo for derived state
- Fix dependency array

**Recommendation**: Fix infinite loop in useEffect
**Library**: React

**Applies to**: react, nextjs


**Source**: `src/rules/data/react.json`

---

### REACT_MISSING_DEPS: useEffect without exhaustive deps

**Severity**: HIGH | **Category**: architecture

useEffect missing dependencies in deps array. This can cause stale closures.

**What it catches:**
- Missing dependencies in useEffect
- Stale closures
- Buggy behavior

**How to fix:**
- Add all dependencies to deps array
- Use eslint-plugin-react-hooks
- Fix missing dependencies

**Recommendation**: Add exhaustive deps to useEffect
**Library**: React

**Applies to**: react, nextjs


**Source**: `src/rules/data/react.json`

---

### REACT_MISSING_KEY: Map without keys

**Severity**: HIGH | **Category**: architecture

Missing key prop in list rendering. Keys help React identify changed items.

**What it catches:**
- Missing key prop in list
- Performance issues
- Wrong item updates

**How to fix:**
- Add unique key prop
- Use stable IDs
- Avoid index as key

**Recommendation**: Add key prop to list items
**Library**: React

**Applies to**: react, nextjs


**Source**: `src/rules/data/react.json`

---

### REACT_SETSTATE_OBJ_MUTATION: Mutating state object directly

**Severity**: HIGH | **Category**: architecture

Mutating state directly breaks React. Always use setState with new object.

**What it catches:**
- Mutating state object directly
- setState not triggering re-render
- State not updating properly

**How to fix:**
- Create new object with spread operator
- Use Immer for immutable updates
- Always return new object from setState

**Recommendation**: Don't mutate state object
**Library**: React

**Applies to**: react, nextjs


**Source**: `src/rules/data/react.json`

---

### REACT_SHOULD_COMPONENT_UPDATE: Legacy shouldComponentUpdate

**Severity**: LOW | **Category**: architecture

shouldComponentUpdate is deprecated. Use React.memo for function components.

**What it catches:**
- Using deprecated lifecycle method
- Class component optimization
- Old React patterns

**How to fix:**
- Convert to functional component with React.memo
- Use memo with custom comparison
- Refactor to hooks

**Recommendation**: Use React.memo instead of shouldComponentUpdate
**Library**: React

**Applies to**: react, nextjs


**Source**: `src/rules/data/react.json`

---

### REACT_STALE_CLOSURE: useCallback without proper deps

**Severity**: MEDIUM | **Category**: architecture

useCallback without proper dependencies can lead to stale closures.

**What it catches:**
- Missing deps in useCallback
- Stale closure values
- Buggy callbacks

**How to fix:**
- Add all dependencies
- Use useCallback properly
- Fix dependency array

**Recommendation**: Add proper dependencies to useCallback
**Library**: React

**Applies to**: react, nextjs


**Source**: `src/rules/data/react.json`

---

### REMIX_CLIENT_ONLY: Client-only code in loader

**Severity**: HIGH | **Category**: architecture

Client-only code in loader runs on server. Move to clientLoader or useEffect.

**What it catches:**
- Server crashes on browser APIs
- ReferenceError on server
- SSR failures

**How to fix:**
- Move to clientLoader function
- Use useEffect for client logic
- Guard with typeof window checks

**Recommendation**: Move client-only code to clientLoader or useEffect
**Library**: Remix

**Applies to**: remix


**Source**: `src/rules/data/remix.json`

---

### REMIX_LOADER_ERROR: Loader error not handled

**Severity**: HIGH | **Category**: architecture

Loaders should have error handling for proper error states.

**What it catches:**
- Unhandled exceptions in loader
- Crashed pages
- Poor error handling

**How to fix:**
- Wrap loader in try-catch
- Return error responses
- Throw Response for errors

**Recommendation**: Handle errors in loader
**Library**: Remix

**Applies to**: remix


**Source**: `src/rules/data/remix.json`

---

### REMIX_NO_ERROR_BOUNDARY: No ErrorBoundary in route

**Severity**: MEDIUM | **Category**: architecture

Routes should have ErrorBoundary for graceful error handling.

**What it catches:**
- Crashed routes show nothing
- No graceful error handling
- Poor UX on errors

**How to fix:**
- Add ErrorBoundary export to route
- Handle errors gracefully
- Show helpful error messages

**Recommendation**: Add ErrorBoundary to route
**Library**: Remix

**Applies to**: remix


**Source**: `src/rules/data/remix.json`

---

### SAAS_NO_API_VERSION: API not versioned

**Severity**: MEDIUM | **Category**: architecture

APIs should be versioned (/v1/, /v2/) to allow breaking changes without affecting clients.

**What it catches:**
- No API versioning
- Breaking changes affect all clients
- No way to deprecate safely

**How to fix:**
- Add /v1/, /v2/ to routes
- Version in header Accept
- Plan deprecation strategy

**Recommendation**: Version your API
**Library**: API Design

**Applies to**: express, fastify


**Source**: `src/rules/data/saas.json`

---

### SAAS_NO_ERROR_RESPONSE: No standardized error handler

**Severity**: MEDIUM | **Category**: architecture

Errors should follow consistent format across all endpoints.

**What it catches:**
- Inconsistent error formats
- No error middleware
- Different error responses per route

**How to fix:**
- Create error middleware
- Standardize error format
- Use error classes

**Recommendation**: Standardize error responses
**Library**: API Design

**Applies to**: express, fastify


**Source**: `src/rules/data/saas.json`

---

### SOLID_ARRAY_MUTATION: Mutating arrays in reactivity

**Severity**: HIGH | **Category**: architecture

SolidJS reactivity requires reassignment, not mutation. Use [...arr] pattern.

**What it catches:**
- UI not updating on array changes
- Mutation not detected
- Wrong reactivity

**How to fix:**
- Use spread operator: [...arr, newItem]
- Use setStore for nested reactivity
- Create new arrays, don't mutate

**Recommendation**: Use immutable patterns for arrays
**Library**: SolidJS

**Applies to**: solidjs


**Source**: `src/rules/data/solidjs.json`

---

### SOLID_FOR_KEY: For loop without key

**Severity**: HIGH | **Category**: architecture

SolidJS For component needs a key function for proper list updates.

**What it catches:**
- Missing key function in For
- Incorrect list updates
- Performance issues

**How to fix:**
- Add key function to For component
- Use unique ID from data
- Avoid array index as key

**Recommendation**: Add key to For component
**Library**: SolidJS

**Applies to**: solidjs


**Source**: `src/rules/data/solidjs.json`

---

### SOLID_REACTIVITY_WRONG: Using React patterns in Solid

**Severity**: HIGH | **Category**: architecture

SolidJS uses signals, not hooks like React. Do not use useState, useEffect.

**What it catches:**
- Using React hooks in SolidJS
- Wrong reactivity patterns
- Code not working as expected

**How to fix:**
- Use createSignal instead of useState
- Use createEffect instead of useEffect
- Use createMemo instead of useMemo

**Recommendation**: Use SolidJS reactivity correctly
**Library**: SolidJS

**Applies to**: solidjs


**Source**: `src/rules/data/solidjs.json`

---

### SVELTE_AWAIT_BLOCK_ERROR: Await block without catch

**Severity**: LOW | **Category**: architecture

Await blocks should have catch for error handling.

**What it catches:**
- Unhandled promise rejections
- Uncaught errors in async operations
- Poor error handling

**How to fix:**
- Add catch block to await
- Handle errors in try-catch
- Show error state to user

**Recommendation**: Add error handling to await blocks
**Library**: Svelte

**Applies to**: svelte


**Source**: `src/rules/data/svelte.json`

---

### SVELTE_CONTEXT_LEAK: Context used incorrectly

**Severity**: MEDIUM | **Category**: architecture

Context must be set in onMount or asynchronously.

**What it catches:**
- Context not available
- SSR issues
- Undefined context values

**How to fix:**
- Set context in onMount
- Use await after setContext
- Check context exists before use

**Recommendation**: Fix context usage
**Library**: Svelte

**Applies to**: svelte


**Source**: `src/rules/data/svelte.json`

---

### SVELTE_DESTROYED_LIFECYCLE: onDestroy without onMount pattern

**Severity**: LOW | **Category**: architecture

Always cleanup subscriptions and timers in onDestroy.

**What it catches:**
- Memory leaks
- Timers running after destroy
- Subscriptions not cleaned

**How to fix:**
- Use onDestroy for cleanup
- Clear intervals and timeouts
- Unsubscribe from stores

**Recommendation**: Add cleanup in onDestroy
**Library**: Svelte

**Applies to**: svelte


**Source**: `src/rules/data/svelte.json`

---

### SVELTE_EVENT_FORWARD: Manual event forwarding

**Severity**: LOW | **Category**: architecture

Use event forwarding instead of manual forwarding.

**What it catches:**
- Boilerplate event handlers
- Missing event forwarding
- Extra code

**How to fix:**
- Use on:eventname on element
- Forward events automatically
- Avoid createEventDispatcher

**Recommendation**: Use event forwarding
**Library**: Svelte

**Applies to**: svelte


**Source**: `src/rules/data/svelte.json`

---

### SVELTE_GLOBAL_STYLE: Global styles in component

**Severity**: LOW | **Category**: architecture

Global styles should be in global CSS files.

**What it catches:**
- Styles affecting other components
- Unexpected style overrides
- CSS pollution

**How to fix:**
- Move to global CSS file
- Use scoped styles only
- Avoid :global() unless needed

**Recommendation**: Avoid global styles in components
**Library**: Svelte

**Applies to**: svelte


**Source**: `src/rules/data/svelte.json`

---

### SVELTE_IMMUTABLE_TRACK: $state without proper immutability

**Severity**: MEDIUM | **Category**: architecture

Use $state with proper immutability patterns.

**What it catches:**
- Reactivity not triggering
- State changes not detected
- Performance issues

**How to fix:**
- Use immutable patterns with $state
- Assign new values, don't mutate
- Use $state.snapshot for cloning

**Recommendation**: Use immutable tracking correctly
**Library**: Svelte

**Applies to**: svelte
**File Extensions**: .svelte, .ts

**Source**: `src/rules/data/svelte.json`

---

### SVELTE_REACTIVITY_ASSIGN: $: with mutation instead of reassignment

**Severity**: MEDIUM | **Category**: architecture

Svelte reactivity works with assignment, not mutation. Use assignment to trigger updates.

**What it catches:**
- Reactivity not triggering
- UI not updating
- Mutation not detected

**How to fix:**
- Use assignment instead of mutation
- Create new arrays/objects
- Trigger reactivity with =

**Recommendation**: Use assignment instead of mutation
**Library**: Svelte

**Applies to**: svelte


**Source**: `src/rules/data/svelte.json`

---

### SVELTE_SLOT_PROP_SPREAD: Spreading props to slots

**Severity**: LOW | **Category**: architecture

Spreading props to slots can cause maintenance issues.

**What it catches:**
- Props passed unintentionally
- Hard to trace data flow
- Maintenance issues

**How to fix:**
- Pass explicit props to slots
- Avoid spread operator on slots
- Document slot prop interface

**Recommendation**: Avoid spreading props to slots
**Library**: Svelte

**Applies to**: svelte


**Source**: `src/rules/data/svelte.json`

---

### SVELTE_STORE_SUBSCRIPTION: Missing unsubscribe on destroy

**Severity**: MEDIUM | **Category**: architecture

Always unsubscribe from stores in onDestroy to prevent memory leaks.

**What it catches:**
- Memory leaks from subscriptions
- Store updates after component destroy
- Unexpected behavior

**How to fix:**
- Use onDestroy to unsubscribe
- Use auto-subscribe with $ prefix
- Store the unsubscribe function

**Recommendation**: Unsubscribe from stores on destroy
**Library**: Svelte

**Applies to**: svelte


**Source**: `src/rules/data/svelte.json`

---

### TRPC_PROCEDURE_SIDE_EFFECT: Mutation in query procedure

**Severity**: HIGH | **Category**: architecture

Query procedures should be pure. Use mutation for side effects (database writes, etc.).

**What it catches:**
- Database writes in query
- Side effects in read operations
- Caching issues

**How to fix:**
- Use procedure.mutation for writes
- Keep queries pure
- Separate read and write logic

**Recommendation**: Use mutation for side effects
**Library**: tRPC

**Applies to**: nextjs, react


**Source**: `src/rules/data/trpc.json`

---

### VUE_COMPOSABLE_SIDE_EFFECT: Composable with side effects

**Severity**: MEDIUM | **Category**: architecture

Composables with side effects should be explicit about them.

**What it catches:**
- Hidden dependencies in composables
- Hard to test composables
- Unexpected behavior

**How to fix:**
- Document side effects clearly
- Return cleanup functions
- Consider pure composables first

**Recommendation**: Avoid side effects in composables
**Library**: Vue

**Applies to**: vue, nuxt
**File Extensions**: .vue, .ts, .js

**Source**: `src/rules/data/vue.json`

---

### VUE_MIXINS_DEPRECATED: Using deprecated mixins

**Severity**: MEDIUM | **Category**: architecture

Mixins are deprecated. Use composables instead.

**What it catches:**
- Using deprecated Vue feature
- Name collisions
- Hard to debug

**How to fix:**
- Extract logic to composables
- Use composables instead of mixins
- Refactor to composition API

**Recommendation**: Avoid using mixins
**Library**: Vue

**Applies to**: vue, nuxt


**Source**: `src/rules/data/vue.json`

---

### VUE_PROP_DEFAULT_MUTATION: Mutating prop in component

**Severity**: CRITICAL | **Category**: architecture

Props should be treated as read-only. Use a local copy if you need to modify it.

**What it catches:**
- Modifying props directly
- Parent component state corruption
- Vue warnings in console

**How to fix:**
- Create local copy with ref/reactive
- Emit events to parent for changes
- Use v-model with props

**Recommendation**: Do not mutate props
**Library**: Vue

**Applies to**: vue, nuxt


**Source**: `src/rules/data/vue.json`

---

### VUE_PROVIDE_INJECT: Provide/inject without reactivity

**Severity**: LOW | **Category**: architecture

Provide/inject should maintain reactivity.

**What it catches:**
- Values not updating in descendants
- Provide/inject not working
- Static values passed

**How to fix:**
- Pass ref() or reactive() objects
- Use toRef/toRefs for reactivity
- Consider using Pinia instead

**Recommendation**: Use provide/inject correctly
**Library**: Vue

**Applies to**: vue, nuxt
**File Extensions**: .vue, .ts

**Source**: `src/rules/data/vue.json`

---

### VUE_REACTIVE_PRIMITIVE: Wrong reactivity primitive

**Severity**: LOW | **Category**: architecture

Use ref() for primitives and reactive() for objects.

**What it catches:**
- Using wrong primitive type
- Reactivity not working
- Unnecessary unwrapping

**How to fix:**
- Use ref() for primitives (string, number, boolean)
- Use reactive() for objects
- Use shallowRef for large arrays

**Recommendation**: Use correct reactivity primitive
**Library**: Vue

**Applies to**: vue, nuxt


**Source**: `src/rules/data/vue.json`

---

### VUE_REACTIVITY_LEAK: Unreactive object mutation

**Severity**: HIGH | **Category**: architecture

Mutating objects directly breaks Vue reactivity. Use reactive() properly.

**What it catches:**
- Changes not detected by Vue
- UI doesn't update
- Hard-to-debug issues

**How to fix:**
- Use ref() for reactive primitives
- Use reactive() for objects properly
- Assign new values, don't mutate

**Recommendation**: Fix unreactive object mutation
**Library**: Vue

**Applies to**: vue, nuxt
**File Extensions**: .vue, .ts, .js

**Source**: `src/rules/data/vue.json`

---

### VUE_V_FOR_INDEX: v-for without key

**Severity**: HIGH | **Category**: architecture

v-for should always have a unique key for proper list rendering.

**What it catches:**
- Missing key on list items
- Incorrect DOM updates
- Performance issues

**How to fix:**
- Add :key with unique ID
- Avoid using index as key
- Use stable identifiers

**Recommendation**: Add key to v-for
**Library**: Vue

**Applies to**: vue, nuxt


**Source**: `src/rules/data/vue.json`

---

### VUE_WATCH_IMMEDIATE: watch without immediate option

**Severity**: LOW | **Category**: architecture

If you need the initial value in watch, use immediate: true.

**What it catches:**
- Watch doesn't run on initial value
- Missing initial setup logic
- Confusing behavior

**How to fix:**
- Add immediate: true to watch
- Consider using watchEffect for simpler cases
- Handle both initial and change cases

**Recommendation**: Use immediate option for watch on mount
**Library**: Vue

**Applies to**: vue, nuxt


**Source**: `src/rules/data/vue.json`

---

## Caching

### CACHE_NO_INVALIDATION: Missing cache invalidation strategy

**Severity**: MEDIUM | **Category**: caching

Have a clear strategy for when cached data becomes stale.

**What it catches:**
- No cache invalidation strategy
- Stale data served indefinitely
- Data inconsistencies

**How to fix:**
- Plan cache invalidation
- Use write-through or write-back
- Invalidate on data change

**Recommendation**: Plan cache invalidation
**Library**: Cache patterns

**Applies to**: All frameworks
**File Extensions**: .ts, .js

**Source**: `src/rules/data/caching.json`

---

### CACHE_NO_KEY_PREFIX: Cache missing key prefix

**Severity**: LOW | **Category**: caching

Key prefixes prevent collisions and aid debugging.

**What it catches:**
- No key prefix
- Potential key collisions
- Hard to debug

**How to fix:**
- Add key prefixes
- Use namespace
- Make keys descriptive

**Recommendation**: Use cache key prefixes
**Library**: Redis

**Applies to**: All frameworks
**File Extensions**: .ts, .js

**Source**: `src/rules/data/caching.json`

---

### CACHE_NO_TTL: Cache entry missing TTL

**Severity**: MEDIUM | **Category**: caching

Cache entries should have expiration times.

**What it catches:**
- Cache entry without TTL
- Data never expires
- Potential stale data

**How to fix:**
- Set TTL for cache entries
- Choose appropriate expiration
- Use setEx or similar

**Recommendation**: Set cache TTL
**Library**: Redis, Memcached

**Applies to**: All frameworks
**File Extensions**: .ts, .js

**Source**: `src/rules/data/caching.json`

---

### CACHE_STALE_WHILE_REVALIDATE: Missing stale-while-revalidate pattern

**Severity**: LOW | **Category**: caching

Serve stale content while revalidating in background.

**What it catches:**
- No stale-while-revalidate
- Stale content not served
- Slower response times

**How to fix:**
- Implement stale-while-revalidate
- Serve stale while revalidating
- Improve response times

**Recommendation**: Use stale-while-revalidate
**Library**: HTTP Cache, Redis

**Applies to**: All frameworks
**File Extensions**: .ts, .js

**Source**: `src/rules/data/caching.json`

---

## Cicd

### CI_NO_ARTIFACT: CI not saving artifacts

**Severity**: LOW | **Category**: cicd

Save build outputs for debugging failed deployments.

**What it catches:**
- No artifacts saved
- Can't debug failed builds
- No build output for review

**How to fix:**
- Add upload-artifact step
- Save build outputs
- Configure retention period

**Recommendation**: Save build artifacts
**Library**: GitHub Actions artifacts

**Applies to**: All frameworks
**File Extensions**: .yml, .yaml

**Source**: `src/rules/data/cicd.json`

---

### CI_NO_CACHE: CI not using caching

**Severity**: MEDIUM | **Category**: cicd

Cache node_modules, build outputs for faster CI runs.

**What it catches:**
- No caching in CI pipeline
- Slow CI runs
- Wasted build time

**How to fix:**
- Add cache for node_modules
- Cache build outputs
- Use restore-keys for fallback

**Recommendation**: Enable dependency caching
**Library**: GitHub Actions cache, GitLab cache

**Applies to**: All frameworks
**File Extensions**: .yml, .yaml

**Source**: `src/rules/data/cicd.json`

---

### CI_NO_ENV_SECRETS: CI using secrets directly

**Severity**: HIGH | **Category**: cicd

Never hardcode secrets in CI configs. Use secret variables.

**What it catches:**
- Hardcoded secrets in CI
- Secrets exposed in logs
- Security vulnerability

**How to fix:**
- Use GitHub Secrets
- Use environment variables
- Never commit secrets

**Recommendation**: Use CI secrets, not hardcoded values
**Library**: GitHub Secrets, GitLab CI Variables

**Applies to**: All frameworks
**File Extensions**: .yml, .yaml

**Source**: `src/rules/data/cicd.json`

---

### CI_NO_FAIL_FAST: CI not using fail-fast

**Severity**: LOW | **Category**: cicd

Fail fast on critical jobs, not on lint/test matrix.

**What it catches:**
- No fail-fast strategy
- All jobs run even after failure
- Wasted CI time

**How to fix:**
- Use fail-fast for critical jobs
- Don't use on lint/test matrix
- Optimize CI time

**Recommendation**: Use fail-fast strategically
**Library**: GitHub Actions

**Applies to**: All frameworks
**File Extensions**: .yml, .yaml

**Source**: `src/rules/data/cicd.json`

---

### CI_NO_LINT: CI not running linters

**Severity**: MEDIUM | **Category**: cicd

Run ESLint in CI to catch style issues before merge.

**What it catches:**
- Linting not in CI pipeline
- Style issues reach production
- No automated code review

**How to fix:**
- Add ESLint to CI pipeline
- Run before merge
- Block on lint errors

**Recommendation**: Run lint in CI
**Library**: ESLint, CI pipeline

**Applies to**: All frameworks
**File Extensions**: .yml, .yaml

**Source**: `src/rules/data/cicd.json`

---

### CI_NO_NPMrc: Missing .npmrc in CI

**Severity**: LOW | **Category**: cicd

.npmrc ensures consistent package resolution in CI.

**What it catches:**
- No .npmrc in CI
- Inconsistent package resolution
- Potential install differences

**How to fix:**
- Add .npmrc file
- Configure registry and settings
- Commit to repo

**Recommendation**: Add .npmrc for consistent installs
**Library**: .npmrc

**Applies to**: All frameworks
**File Extensions**: .npmrc

**Source**: `src/rules/data/cicd.json`

---

### CI_NO_SECURITY_SCAN: CI not running security scans

**Severity**: HIGH | **Category**: cicd

Run npm audit, Snyk, or Dependabot in CI.

**What it catches:**
- No security scanning in CI
- Vulnerabilities reach production
- No automated security checks

**How to fix:**
- Add npm audit to CI
- Use Snyk or Dependabot
- Block on high vulnerabilities

**Recommendation**: Add security scanning
**Library**: npm audit, Snyk, Dependabot

**Applies to**: All frameworks
**File Extensions**: .yml, .yaml

**Source**: `src/rules/data/cicd.json`

---

### CI_NO_TIMEOUT: CI jobs missing timeout

**Severity**: MEDIUM | **Category**: cicd

Prevent hung jobs from blocking CI. Set reasonable timeouts.

**What it catches:**
- No timeout on CI jobs
- Hung jobs block pipeline
- Wasted resources

**How to fix:**
- Set timeout-minutes
- Choose reasonable timeout
- Handle timeouts gracefully

**Recommendation**: Set job timeouts
**Library**: CI timeout

**Applies to**: All frameworks
**File Extensions**: .yml, .yaml

**Source**: `src/rules/data/cicd.json`

---

## Cleanliness

### CLEAN_COMMENTED_CODE: Commented out code

**Severity**: LOW | **Category**: cleanliness

Commented out code reduces readability. Remove it or use version control.

**What it catches:**
- Commented out code
- Reduces readability
- Confuses developers

**How to fix:**
- Remove commented code
- Use version control instead
- Delete unused code

**Recommendation**: Remove commented code
**Library**: Code cleanliness

**Applies to**: All frameworks


**Source**: `src/rules/data/cleanliness.json`

---

### CLEAN_CONSOLE_ERROR: Using console.log for errors

**Severity**: LOW | **Category**: cleanliness

Use proper error logging instead of console.log for errors.

**What it catches:**
- console.error used
- No structured error logging
- Hard to track errors

**How to fix:**
- Use proper logger
- Add error context
- Set appropriate log levels

**Recommendation**: Use proper error logging
**Library**: Logging

**Applies to**: All frameworks


**Source**: `src/rules/data/cleanliness.json`

---

### CLEAN_CONSOLE_LOG: Console.log in code

**Severity**: LOW | **Category**: cleanliness

Console.log should be replaced with proper logging library.

**What it catches:**
- console.log in production code
- No log levels
- Hard to debug in production

**How to fix:**
- Use logging library (winston, pino)
- Add log levels
- Configure for production

**Recommendation**: Use proper logging
**Library**: winston, pino

**Applies to**: All frameworks


**Source**: `src/rules/data/cleanliness.json`

---

### CLEAN_DEAD_CODE: Potential dead code

**Severity**: LOW | **Category**: cleanliness

Dead code reduces maintainability. Remove unreachable code.

**What it catches:**
- Dead code exists
- Unreachable code
- Reduces maintainability

**How to fix:**
- Remove unreachable code
- Clean up TODO/FIXME comments
- Use version control

**Recommendation**: Remove dead code
**Library**: Code cleanliness

**Applies to**: All frameworks
**File Extensions**: .ts, .js

**Source**: `src/rules/data/cleanliness.json`

---

### CLEAN_NO_LOGGER: Using console.log instead of logger

**Severity**: LOW | **Category**: cleanliness

Use a structured logging library instead of console.log.

**What it catches:**
- No structured logging
- console.log instead of logger
- Hard to analyze logs

**How to fix:**
- Install winston or pino
- Replace console.log
- Add log levels

**Recommendation**: Use structured logging
**Library**: winston, pino

**Applies to**: All frameworks


**Source**: `src/rules/data/cleanliness.json`

---

### COMP_CONSOLE_LOG: Console log statements

**Severity**: LOW | **Category**: cleanliness

Console.log statements should be removed in production.

**What it catches:**
- console.log in code
- Debug statements left in
- No log levels

**How to fix:**
- Remove console.log
- Use logging library
- Configure for environment

**Recommendation**: Remove console logs
**Library**: Code cleanliness

**Applies to**: All frameworks
**File Extensions**: .ts, .js, .jsx, .tsx

**Source**: `src/rules/data/complexity.json`

---

### COMP_DEAD_CODE: Potential dead code

**Severity**: LOW | **Category**: cleanliness

Unused code should be removed. It confuses readers and bloats builds.

**What it catches:**
- Dead code exists
- Confuses readers
- Bloats builds

**How to fix:**
- Remove unused functions
- Delete unreachable code
- Clean up exports

**Recommendation**: Remove dead code
**Library**: Code cleanliness

**Applies to**: All frameworks
**File Extensions**: .ts, .js

**Source**: `src/rules/data/complexity.json`

---

### LOG_CONSOLE_LOG: Console.log in code

**Severity**: LOW | **Category**: cleanliness

Debug statements should be removed or replaced with proper logging.

**What it catches:**
- Debug statements left in code
- Console output in production
- No log levels configured

**How to fix:**
- Remove debug statements before production
- Use proper logger with levels
- Configure log level by environment

**Recommendation**: Remove console.log statements
**Library**: Logging

**Applies to**: All frameworks


**Source**: `src/rules/data/logging.json`

---

## Cli

### CLI_NO_ERROR_HANDLING: CLI missing error handling

**Severity**: HIGH | **Category**: cli

Handle errors gracefully and exit with proper codes.

**What it catches:**
- No error handling in CLI
- Crashes without explanation
- Poor exit codes

**How to fix:**
- Add error handling
- Handle uncaught exceptions
- Exit with proper codes

**Recommendation**: Add error handling to CLI
**Library**: CLI

**Applies to**: All frameworks
**File Extensions**: .ts

**Source**: `src/rules/data/cli.json`

---

### CLI_NO_HELP: CLI missing help

**Severity**: LOW | **Category**: cli

CLIs should have --help option.

**What it catches:**
- No --help option
- Users can't get help
- Poor documentation

**How to fix:**
- Add --help option
- Show usage information
- Document all options

**Recommendation**: Add help option to CLI
**Library**: CLI

**Applies to**: All frameworks
**File Extensions**: .ts

**Source**: `src/rules/data/cli.json`

---

### CLI_NO_OUTPUT: CLI produces no output

**Severity**: MEDIUM | **Category**: cli

CLI tools should provide feedback to users.

**What it catches:**
- CLI produces no output
- User gets no feedback
- Confusing user experience

**How to fix:**
- Add console output for feedback
- Show progress for long operations
- Print success/error messages

**Recommendation**: Add output to CLI
**Library**: CLI

**Applies to**: All frameworks
**File Extensions**: .ts

**Source**: `src/rules/data/cli.json`

---

### CLI_NO_VERSION: CLI missing version

**Severity**: LOW | **Category**: cli

CLIs should have --version option.

**What it catches:**
- No --version option
- Can't check version
- Debugging issues

**How to fix:**
- Add --version option
- Show version from package.json
- Use -v shorthand

**Recommendation**: Add version option to CLI
**Library**: CLI

**Applies to**: All frameworks
**File Extensions**: .ts

**Source**: `src/rules/data/cli.json`

---

### CLI_PARSER_MISSING: CLI using manual argument parsing

**Severity**: MEDIUM | **Category**: cli

Use a library like yargs, commander, or meow for robust argument parsing.

**What it catches:**
- Manual argument parsing
- Error-prone and limited
- No built-in help

**How to fix:**
- Use yargs or commander
- Get free --help and --version
- Handle arguments robustly

**Recommendation**: Use a CLI parser library
**Library**: CLI

**Applies to**: All frameworks
**File Extensions**: .ts

**Source**: `src/rules/data/cli.json`

---

## Complexity

### COMP_BIG_FILE: File too large

**Severity**: MEDIUM | **Category**: complexity

Files over 500 lines are hard to maintain. Consider splitting into smaller modules.

**What it catches:**
- File too large (500+ lines)
- Hard to maintain
- Hard to navigate

**How to fix:**
- Split into smaller files
- Extract related code
- Organize by feature

**Recommendation**: Split large files
**Library**: Code organization

**Applies to**: All frameworks


**Source**: `src/rules/data/complexity.json`

---

### COMP_CYCLOMATIC: High cyclomatic complexity

**Severity**: MEDIUM | **Category**: complexity

High cyclomatic complexity indicates complex logic. Consider refactoring.

**What it catches:**
- High cyclomatic complexity
- Complex logic hard to test
- More bugs likely

**How to fix:**
- Refactor complex functions
- Extract to smaller functions
- Use early returns

**Recommendation**: Reduce cyclomatic complexity
**Library**: Code complexity

**Applies to**: All frameworks


**Source**: `src/rules/data/complexity.json`

---

### COMP_NESTING: Deeply nested code

**Severity**: MEDIUM | **Category**: complexity

Deeply nested code is hard to read. Consider early returns or extraction.

**What it catches:**
- Deeply nested code
- Hard to read and maintain
- High cyclomatic complexity

**How to fix:**
- Use early returns
- Extract to helper functions
- Reduce nesting levels

**Recommendation**: Reduce nesting depth
**Library**: Code style

**Applies to**: All frameworks
**File Extensions**: .ts, .js

**Source**: `src/rules/data/complexity.json`

---

### COMP_PARAMS: Too many function parameters

**Severity**: LOW | **Category**: complexity

Too many parameters make functions hard to use. Consider passing an object.

**What it catches:**
- Too many function parameters
- Hard to use and remember
- Code smell

**How to fix:**
- Pass an object instead
- Group related params
- Use options pattern

**Recommendation**: Reduce function parameters
**Library**: Code style

**Applies to**: All frameworks
**File Extensions**: .ts, .js

**Source**: `src/rules/data/complexity.json`

---

## Cors

### CORS_CREDENTIALS: CORS credentials with wildcard origin

**Severity**: CRITICAL | **Category**: cors

Cannot use credentials with wildcard origin. Specify exact origins.

**What it catches:**
- Browser rejects credentials request
- CORS error in browsers
- API breaks for frontend

**How to fix:**
- Remove wildcard origin
- Specify exact origins for credentials
- Use origin whitelist

**Recommendation**: Fix credentials with wildcard
**Library**: CORS

**Applies to**: All frameworks
**File Extensions**: .ts, .js

**Source**: `src/rules/data/cors.json`

---

### CORS_NO_CONFIG: Missing CORS configuration

**Severity**: MEDIUM | **Category**: cors

CORS should be explicitly configured, not left permissive.

**What it catches:**
- API accessible from any domain
- No control over who accesses API
- Potential data exposure

**How to fix:**
- Configure allowed origins explicitly
- Use environment variables for origins
- Implement origin validation

**Recommendation**: Configure CORS properly
**Library**: cors, @fastify/cors

**Applies to**: express, fastify, nextjs, nuxt
**File Extensions**: .ts, .js

**Source**: `src/rules/data/cors.json`

---

### CORS_NO_EXPOSE_HEADERS: Missing Access-Control-Expose-Headers

**Severity**: LOW | **Category**: cors

Custom headers need to be exposed to be accessible from frontend.

**What it catches:**
- Custom headers not accessible
- Can't read response headers
- Broken frontend functionality

**How to fix:**
- Add exposeHeaders configuration
- List needed custom headers
- Allow frontend access

**Recommendation**: Expose custom headers
**Library**: CORS

**Applies to**: All frameworks
**File Extensions**: .ts, .js

**Source**: `src/rules/data/cors.json`

---

### CORS_NO_MAX_AGE: Missing Access-Control-Max-Age

**Severity**: LOW | **Category**: cors

Setting Max-Age reduces preflight requests.

**What it catches:**
- Extra preflight requests
- Increased latency
- Unnecessary OPTIONS calls

**How to fix:**
- Set maxAge to reasonable value (e.g., 86400)
- Cache preflight for stable APIs
- Balance security with performance

**Recommendation**: Set preflight cache duration
**Library**: CORS

**Applies to**: All frameworks
**File Extensions**: .ts, .js

**Source**: `src/rules/data/cors.json`

---

### CORS_WILDCARD: CORS allows all origins

**Severity**: HIGH | **Category**: cors

Allowing all origins (* ) is a security risk. Specify allowed origins.

**What it catches:**
- Any website can call API
- Data exposed to unauthorized sites
- Security vulnerabilities

**How to fix:**
- Specify exact allowed origins
- Use array of allowed origins
- Implement origin allowlist

**Recommendation**: Don't use wildcard origin in production
**Library**: CORS configuration

**Applies to**: All frameworks
**File Extensions**: .ts, .js, .json

**Source**: `src/rules/data/cors.json`

---

## Css

### CSS_DUPLICATE_VALUES: Duplicate CSS values across files

**Severity**: LOW | **Category**: css

Colors, font sizes, and spacing values used multiple times should be defined as CSS variables for consistency and easier maintenance.

**What it catches:**
- Duplicate CSS values
- Inconsistent styling
- Hard to maintain

**How to fix:**
- Use CSS custom properties
- Define design tokens
- Centralize values

**Recommendation**: Use CSS custom properties for repeated values
**Library**: CSS Custom Properties

**Applies to**: All frameworks


**Source**: `src/rules/data/css.json`

---

### CSS_FLEX_GAP: Using margins instead of gap

**Severity**: LOW | **Category**: css

The gap property is cleaner than margin hacks for flex/grid containers.

**What it catches:**
- Using margins instead of gap
- Extra markup needed
- Inconsistent spacing

**How to fix:**
- Use gap property
- Remove margin hacks
- Simplify layout

**Recommendation**: Use gap for flex/grid spacing
**Library**: CSS Flexbox, CSS Grid

**Applies to**: All frameworks
**File Extensions**: .css, .scss, .less

**Source**: `src/rules/data/css.json`

---

### CSS_FONT_FAMILY: Web fonts without font-display

**Severity**: MEDIUM | **Category**: css

font-display prevents invisible text while fonts load.

**What it catches:**
- Web font without font-display
- Invisible text on load
- Poor UX

**How to fix:**
- Add font-display: swap
- Use optional for faster loading
- Prevent FOIT

**Recommendation**: Add font-display for web fonts
**Library**: CSS

**Applies to**: All frameworks
**File Extensions**: .css, .scss, .less

**Source**: `src/rules/data/css.json`

---

### CSS_GLOBAL_NAMESPACE: Global CSS without scoping

**Severity**: MEDIUM | **Category**: css

Use CSS modules, CSS-in-JS, or scoped styles to prevent global namespace pollution.

**What it catches:**
- Global CSS without scoping
- Namespace pollution
- Style conflicts

**How to fix:**
- Use CSS Modules
- Use scoped styles
- Use CSS-in-JS

**Recommendation**: Scope CSS to components
**Library**: CSS Modules, Vue scoped CSS

**Applies to**: react, vue, svelte, angular
**File Extensions**: .css, .scss, .less

**Source**: `src/rules/data/css.json`

---

### CSS_HARDCODED_COLORS: Hardcoded color values

**Severity**: LOW | **Category**: css

Hardcoded colors prevent theming. Use CSS variables.

**What it catches:**
- Hardcoded color values
- No theming support
- Hard to change globally

**How to fix:**
- Use CSS variables for colors
- Define color palette
- Enable theming

**Recommendation**: Use CSS custom properties for colors
**Library**: CSS Custom Properties

**Applies to**: All frameworks
**File Extensions**: .css, .scss, .less

**Source**: `src/rules/data/css.json`

---

### CSS_IMPORTANT_ABUSE: Overuse of !important

**Severity**: LOW | **Category**: css

!important breaks CSS specificity and makes maintenance difficult.

**What it catches:**
- !important used excessively
- Breaks CSS specificity
- Hard to maintain

**How to fix:**
- Use proper specificity
- Avoid !important
- Use more specific selectors

**Recommendation**: Avoid !important declarations
**Library**: CSS

**Applies to**: All frameworks
**File Extensions**: .css, .scss, .less, .tsx, .jsx, .vue, .svelte

**Source**: `src/rules/data/css.json`

---

### CSS_INLINE_STYLES: Inline styles detected

**Severity**: MEDIUM | **Category**: css

Inline styles prevent CSS optimization and reduce maintainability.

**What it catches:**
- Inline styles in components
- No CSS optimization
- Hard to maintain

**How to fix:**
- Use CSS classes
- Use CSS Modules
- Use styled-components

**Recommendation**: Use CSS classes instead of inline styles
**Library**: CSS Modules, styled-components

**Applies to**: react, vue, svelte, angular
**File Extensions**: .tsx, .jsx, .vue, .svelte

**Source**: `src/rules/data/css.json`

---

### CSS_MAGIC_NUMBERS: Magic numbers in CSS

**Severity**: LOW | **Category**: css

Hardcoded pixel values make responsive design harder. Use CSS variables.

**What it catches:**
- Hardcoded pixel values
- Magic numbers in CSS
- Hard to maintain

**How to fix:**
- Use CSS custom properties
- Define spacing variables
- Use rem/em units

**Recommendation**: Use CSS custom properties
**Library**: CSS Custom Properties

**Applies to**: All frameworks
**File Extensions**: .css, .scss, .less

**Source**: `src/rules/data/css.json`

---

### CSS_SPECIFICITY_HIGH: High CSS specificity

**Severity**: LOW | **Category**: css

High specificity selectors are hard to override and maintain.

**What it catches:**
- High specificity selectors
- Hard to override
- Maintenance issues

**How to fix:**
- Use BEM methodology
- Keep selectors simple
- Use CSS Modules

**Recommendation**: Keep specificity low
**Library**: BEM, CSS Modules

**Applies to**: All frameworks
**File Extensions**: .css, .scss, .less

**Source**: `src/rules/data/css.json`

---

## Dependencies

### DEPS_NO_LOCKFILE: Missing lockfile

**Severity**: HIGH | **Category**: dependencies

Lockfiles ensure consistent dependency versions across environments.

**What it catches:**
- No lockfile in project
- Inconsistent dependency versions
- Reproducibility issues

**How to fix:**
- Generate package-lock.json
- Use yarn.lock or pnpm-lock.yaml
- Commit lockfile to repo

**Recommendation**: Use lockfiles for reproducible builds
**Library**: package-lock.json, yarn.lock

**Applies to**: All frameworks
**File Extensions**: package!-lock.json, yarn.lock, pnpm-lock.yaml

**Source**: `src/rules/data/dependencies.json`

---

### DEPS_NO_REPOS: Missing repository field

**Severity**: LOW | **Category**: dependencies

Repository field links package to source code.

**What it catches:**
- No repository field
- Package not linked to source
- Hard to navigate

**How to fix:**
- Add repository field
- Link to GitHub repo
- Help users find source

**Recommendation**: Add repository field
**Library**: package.json

**Applies to**: All frameworks
**File Extensions**: package.json

**Source**: `src/rules/data/dependencies.json`

---

### DEPS_PRIVATE: Missing private field for private packages

**Severity**: MEDIUM | **Category**: dependencies

Set "private": true to prevent accidental publishing.

**What it catches:**
- No private field in package.json
- Risk of accidental publishing
- Exposes internal package

**How to fix:**
- Add "private": true
- Prevent accidental publish
- Set in package.json

**Recommendation**: Mark private packages as private
**Library**: package.json

**Applies to**: All frameworks
**File Extensions**: package.json

**Source**: `src/rules/data/dependencies.json`

---

## Docker

### DOCKER_LATEST_TAG: Using latest tag

**Severity**: MEDIUM | **Category**: docker

Using latest can cause unpredictable builds. Pin to specific versions.

**What it catches:**
- Using :latest tag
- Unpredictable builds
- Reproducibility issues

**How to fix:**
- Pin to specific version
- Use version tags
- Update intentionally

**Recommendation**: Use specific version tags
**Library**: Docker

**Applies to**: All frameworks
**File Extensions**: Dockerfile

**Source**: `src/rules/data/docker.json`

---

### DOCKER_NO_CLEANUP: No cleanup in same layer

**Severity**: LOW | **Category**: docker

Combine apt-get install and cleanup in same RUN to reduce image size.

**What it catches:**
- No cleanup in RUN layer
- Larger image size
- Package cache included

**How to fix:**
- Combine install and cleanup
- Use && to chain commands
- Remove apt cache

**Recommendation**: Clean up in same layer
**Library**: Docker

**Applies to**: All frameworks
**File Extensions**: Dockerfile

**Source**: `src/rules/data/docker.json`

---

### DOCKER_NO_HEALTHCHECK: Missing HEALTHCHECK instruction

**Severity**: MEDIUM | **Category**: docker

Health checks allow Docker to monitor container health.

**What it catches:**
- No HEALTHCHECK in Dockerfile
- Can't monitor container health
- Orchestrator issues

**How to fix:**
- Add HEALTHCHECK instruction
- Use curl or similar
- Configure liveness probe

**Recommendation**: Add HEALTHCHECK instruction
**Library**: Docker

**Applies to**: All frameworks
**File Extensions**: Dockerfile

**Source**: `src/rules/data/docker.json`

---

### DOCKER_NO_LABEL: Missing labels

**Severity**: LOW | **Category**: docker

Labels help with container management and organization.

**What it catches:**
- No LABEL in Dockerfile
- Missing metadata
- Hard to manage

**How to fix:**
- Add LABEL directives
- Include maintainer info
- Add version labels

**Recommendation**: Add metadata labels
**Library**: Docker

**Applies to**: All frameworks
**File Extensions**: Dockerfile

**Source**: `src/rules/data/docker.json`

---

### DOCKER_NO_MULTISTAGE: No multi-stage build

**Severity**: MEDIUM | **Category**: docker

Multi-stage builds reduce final image size by excluding build dependencies.

**What it catches:**
- No multi-stage build
- Large final image
- Build dependencies included

**How to fix:**
- Use multi-stage build
- Separate build and run stages
- Reduce image size

**Recommendation**: Use multi-stage builds
**Library**: Docker

**Applies to**: All frameworks
**File Extensions**: Dockerfile

**Source**: `src/rules/data/docker.json`

---

### DOCKER_NO_PORTS: Exposing all ports

**Severity**: LOW | **Category**: docker

Exposing unnecessary ports increases attack surface.

**What it catches:**
- Too many ports exposed
- Increased attack surface
- Security risk

**How to fix:**
- Only expose needed ports
- Remove unnecessary EXPOSE
- Minimize exposure

**Recommendation**: Only expose necessary ports
**Library**: Docker

**Applies to**: All frameworks
**File Extensions**: Dockerfile

**Source**: `src/rules/data/docker.json`

---

### DOCKER_RUN_ROOT: Container running as root

**Severity**: HIGH | **Category**: docker

Running as root is a security risk. Use USER directive.

**What it catches:**
- Container runs as root
- Security vulnerability
- Unnecessary privileges

**How to fix:**
- Add USER directive
- Create non-root user
- Run as specific user

**Recommendation**: Run container as non-root user
**Library**: Docker

**Applies to**: All frameworks
**File Extensions**: Dockerfile

**Source**: `src/rules/data/docker.json`

---

### DOCKER_SUDO: Using sudo in Dockerfile

**Severity**: MEDIUM | **Category**: docker

Sudo is unnecessary when running as non-root user.

**What it catches:**
- sudo in Dockerfile
- Unnecessary privilege
- Security issue

**How to fix:**
- Remove sudo from commands
- Run as non-root user
- Avoid privilege escalation

**Recommendation**: Avoid sudo in Dockerfile
**Library**: Docker

**Applies to**: All frameworks
**File Extensions**: Dockerfile

**Source**: `src/rules/data/docker.json`

---

## Documentation

### DOC_API_MISSING: Missing API documentation

**Severity**: MEDIUM | **Category**: documentation

API endpoints should be documented with OpenAPI/Swagger.

**What it catches:**
- No API documentation
- Hard for consumers to use API
- Integration difficulties

**How to fix:**
- Add OpenAPI/Swagger annotations
- Generate docs from code
- Create interactive API explorer

**Recommendation**: Add API documentation
**Library**: Swagger, OpenAPI

**Applies to**: All frameworks


**Source**: `src/rules/data/documentation.json`

---

### DOC_ENV_NOT_DOCUMENTED: Environment variables not documented

**Severity**: INFO | **Category**: documentation

All environment variables used in code should be documented in .env.example.

**What it catches:**
- Code uses env vars not in .env.example
- Undocumented configuration
- Hard for team to know all required vars

**How to fix:**
- Add used env vars to .env.example
- Document all configuration options
- Keep .env.example in sync with code

**Recommendation**: Document environment variables
**Library**: dotenv

**Applies to**: All frameworks


**Source**: `src/rules/data/documentation.json`

---

### DOC_NO_CONTRIBUTING: Missing CONTRIBUTING guide

**Severity**: INFO | **Category**: documentation

Open source projects should have a CONTRIBUTING guide.

**What it catches:**
- No CONTRIBUTING guide
- No contribution guidelines
- Hard for contributors to know how to help

**How to fix:**
- Create CONTRIBUTING.md
- Document how to set up dev environment
- Explain how to submit changes

**Recommendation**: Add CONTRIBUTING guide
**Library**: Documentation

**Applies to**: All frameworks


**Source**: `src/rules/data/documentation.json`

---

### DOC_NO_ENV_EXAMPLE: Missing environment example file

**Severity**: INFO | **Category**: documentation

Projects using environment variables should have a .env.example file documenting required vars.

**What it catches:**
- No .env.example file
- No documentation of required env vars
- Hard for contributors to know what vars needed

**How to fix:**
- Create .env.example with placeholder values
- Document all required environment variables
- Exclude sensitive values

**Recommendation**: Add .env.example
**Library**: dotenv

**Applies to**: All frameworks


**Source**: `src/rules/data/documentation.json`

---

### DOC_NO_README: Missing README

**Severity**: INFO | **Category**: documentation

Every project should have a README explaining what it is and how to use it.

**What it catches:**
- No README file
- No project documentation
- Hard for others to understand project

**How to fix:**
- Create README.md with project overview
- Include installation instructions
- Add usage examples

**Recommendation**: Add README
**Library**: Documentation

**Applies to**: All frameworks


**Source**: `src/rules/data/documentation.json`

---

## Email

### EMAIL_NO_DKIM: No DKIM/SPF configured

**Severity**: HIGH | **Category**: email

DKIM and SPF prevent email spoofing.

**What it catches:**
- Emails marked as spam
- Email spoofing possible
- Poor deliverability

**How to fix:**
- Configure SPF DNS record
- Set up DKIM signing
- Verify domain

**Recommendation**: Configure email authentication
**Library**: DNS configuration

**Applies to**: All frameworks
**File Extensions**: .ts, .js, .yaml, .yml

**Source**: `src/rules/data/email.json`

---

### EMAIL_NO_FROM: No proper From address

**Severity**: MEDIUM | **Category**: email

Set proper From and Reply-To addresses.

**What it catches:**
- No from address set
- Emails marked as spam
- Poor deliverability

**How to fix:**
- Set proper from address
- Add reply-to for responses
- Verify domain

**Recommendation**: Configure From/Reply-To
**Library**: Email config

**Applies to**: All frameworks
**File Extensions**: .ts, .js

**Source**: `src/rules/data/email.json`

---

### EMAIL_NO_TEMPLATE: Using hardcoded email content

**Severity**: LOW | **Category**: email

Templates allow non-devs to edit emails and support i18n.

**What it catches:**
- Hardcoded email content
- Hard to maintain
- No localization support

**How to fix:**
- Use email templates
- Use Handlebars or React Email
- Allow non-devs to edit

**Recommendation**: Use email templates
**Library**: Handlebars, MJML, React Email

**Applies to**: All frameworks
**File Extensions**: .ts, .js

**Source**: `src/rules/data/email.json`

---

### EMAIL_NO_TRACKING: No email open/click tracking

**Severity**: LOW | **Category**: email

Track opens and clicks to measure engagement.

**What it catches:**
- Can't measure engagement
- No open/click data
- Can't improve emails

**How to fix:**
- Enable tracking in provider
- Track opens and clicks
- Analyze engagement

**Recommendation**: Track email metrics
**Library**: SendGrid, Mailgun tracking

**Applies to**: All frameworks
**File Extensions**: .ts, .js

**Source**: `src/rules/data/email.json`

---

### EMAIL_NO_UNSUBSCRIBE: Missing unsubscribe link

**Severity**: HIGH | **Category**: email

Commercial emails must have working unsubscribe (CAN-SPAM, GDPR).

**What it catches:**
- Violates CAN-SPAM and GDPR
- Legal issues
- Users can't opt out

**How to fix:**
- Add unsubscribe link
- Include List-Unsubscribe header
- Honor opt-outs promptly

**Recommendation**: Include unsubscribe link
**Library**: Email headers

**Applies to**: All frameworks
**File Extensions**: .ts, .js

**Source**: `src/rules/data/email.json`

---

### EMAIL_NO_VERIFY: Email not sent via provider

**Severity**: HIGH | **Category**: email

Use SendGrid, AWS SES, Mailgun. Direct SMTP is unreliable.

**What it catches:**
- Using basic SMTP
- Deliverability issues
- Can't track metrics

**How to fix:**
- Use SendGrid, AWS SES, or Mailgun
- Configure properly
- Monitor delivery rates

**Recommendation**: Use email service provider
**Library**: SendGrid, AWS SES, Mailgun

**Applies to**: All frameworks
**File Extensions**: .ts, .js

**Source**: `src/rules/data/email.json`

---

## Error-handling

### COMP_EMPTY_CATCH: Empty catch block

**Severity**: HIGH | **Category**: error-handling

Empty catch blocks hide errors. Add proper error handling.

**What it catches:**
- Empty catch block
- Errors silently ignored
- Hard to debug

**How to fix:**
- Add error handling
- Log the error
- Re-throw if needed

**Recommendation**: Handle errors properly
**Library**: Error handling

**Applies to**: All frameworks
**File Extensions**: .ts, .js

**Source**: `src/rules/data/complexity.json`

---

### ERR_ASYNC_NO_AWAIT: Async function without await

**Severity**: INFO | **Category**: error-handling

Not awaiting async functions can lead to race conditions.

**What it catches:**
- async function not awaited
- Promise returned but not handled
- Race conditions

**How to fix:**
- Await async functions
- Handle returned promises
- Use proper async patterns

**Recommendation**: Await async function calls
**Library**: Error handling

**Applies to**: All frameworks


**Source**: `src/rules/data/error-handling.json`

---

### ERR_ASYNC_NO_AWAIT_HELPER: Async function not awaited

**Severity**: MEDIUM | **Category**: error-handling

Async functions should be awaited or have their promises handled properly.

**What it catches:**
- Async function called without await
- Promise not handled
- Potential race conditions

**How to fix:**
- Add await to async function calls
- Handle returned promises with .then() or await
- Return value from async functions

**Recommendation**: Await async functions
**Library**: Error handling

**Applies to**: All frameworks


**Source**: `src/rules/data/error-handling.json`

---

### ERR_EMPTY_CATCH: Empty catch block

**Severity**: HIGH | **Category**: error-handling

Empty catch blocks silently swallow errors. Add error handling or logging.

**What it catches:**
- Empty catch blocks
- Errors silently ignored
- Debugging impossible

**How to fix:**
- Add error handling to catch
- Log the error
- Rethrow if needed

**Recommendation**: Handle errors in catch blocks
**Library**: Error handling

**Applies to**: All frameworks


**Source**: `src/rules/data/error-handling.json`

---

### ERR_FUNCTION_NO_ERROR_HANDLING: Function without try-catch

**Severity**: INFO | **Category**: error-handling

Functions that perform async operations, I/O, or external calls should have error handling. Pure functions with no side effects don't need try-catch. Note: This is a best-effort check and may have false positives - use .attuneignore if needed.

**What it catches:**
- Async functions without error handling
- Functions performing I/O without try-catch
- Missing try-catch for external calls

**How to fix:**
- Add try-catch to functions with external calls
- Handle errors gracefully
- Return error values or throw

**Recommendation**: Add error handling to async/I/O functions
**Library**: Error handling

**Applies to**: All frameworks


**Source**: `src/rules/data/error-handling.json`

---

### ERR_MISSING_FINALLY: Missing finally block

**Severity**: LOW | **Category**: error-handling

Finally blocks ensure cleanup code runs regardless of errors.

**What it catches:**
- No finally for cleanup
- Resources not released
- Connections left open

**How to fix:**
- Add finally block
- Clean up resources
- Close connections

**Recommendation**: Add finally block for cleanup
**Library**: Error handling

**Applies to**: All frameworks
**File Extensions**: .ts, .js

**Source**: `src/rules/data/error-handling.json`

---

### ERR_NO_ERROR_BOUNDARY: React app missing error boundary

**Severity**: HIGH | **Category**: error-handling

React apps should have error boundaries to catch rendering errors.

**What it catches:**
- No Error Boundary in React
- App crashes not caught
- No fallback UI

**How to fix:**
- Add Error Boundary component
- Use getDerivedStateFromError
- Add componentDidCatch

**Recommendation**: Add error boundary component
**Library**: React

**Applies to**: react, nextjs


**Source**: `src/rules/data/error-handling.json`

---

### ERR_NO_ERROR_HANDLING: Missing error handling

**Severity**: INFO | **Category**: error-handling

Async operations should have proper error handling. Note: This is a suggestion - if you handle errors differently, you can ignore this.

**What it catches:**
- Async operations without try/catch
- Unhandled promise rejections
- Missing error handling

**How to fix:**
- Wrap async code in try/catch
- Add .catch() to promises
- Handle errors properly

**Recommendation**: Add error handling
**Library**: Error handling

**Applies to**: All frameworks


**Source**: `src/rules/data/error-handling.json`

---

### ERR_PROMISE_CATCH: Promise without catch

**Severity**: HIGH | **Category**: error-handling

Unhandled promise rejections can crash your app.

**What it catches:**
- Promise without .catch()
- Unhandled promise rejection
- Silent failures

**How to fix:**
- Add .catch() to all promises
- Use try/catch with async/await
- Handle rejections properly

**Recommendation**: Add .catch() to promises
**Library**: Error handling

**Applies to**: All frameworks


**Source**: `src/rules/data/error-handling.json`

---

### ERR_SWALLOW_ERRORS: Swallowing errors

**Severity**: HIGH | **Category**: error-handling

Empty catch blocks hide errors. Log or handle them properly.

**What it catches:**
- Empty catch blocks
- Errors silently ignored
- Hidden failures

**How to fix:**
- Log errors in catch blocks
- Handle or rethrow errors
- Never leave catch blocks empty

**Recommendation**: Don't swallow errors
**Library**: Error handling

**Applies to**: All frameworks


**Source**: `src/rules/data/error-handling.json`

---

### ERR_THROW_IN_CALLBACK: Throwing errors in callbacks

**Severity**: MEDIUM | **Category**: error-handling

Throwing in callbacks can cause unhandled exceptions. Use error parameters instead.

**What it catches:**
- Throwing in event callbacks
- throw in async callbacks
- Uncaught exceptions

**How to fix:**
- Use error parameters in callbacks
- Handle errors properly in callbacks
- Don't throw in event handlers

**Recommendation**: Don't throw in callbacks
**Library**: Error handling

**Applies to**: All frameworks


**Source**: `src/rules/data/error-handling.json`

---

## Forms

### FORM_NO_VALIDATION: Form missing validation

**Severity**: HIGH | **Category**: forms

Forms should have both client-side and server-side validation.

**What it catches:**
- No form validation
- Invalid data submitted
- Security issues

**How to fix:**
- Add client-side validation
- Add server-side validation
- Use form library

**Recommendation**: Add form validation
**Library**: Form handling

**Applies to**: All frameworks


**Source**: `src/rules/data/forms.json`

---

### FORM_SUBMIT_PREVENT: Form submit not prevented

**Severity**: MEDIUM | **Category**: forms

Use event.preventDefault() on form submission.

**What it catches:**
- Form submit not prevented
- Page reload on submit
- SPA navigation broken

**How to fix:**
- Call event.preventDefault()
- Handle submission in JS
- Use onSubmit handler

**Recommendation**: Prevent default form submission
**Library**: Form handling

**Applies to**: react, vue


**Source**: `src/rules/data/forms.json`

---

## Graphql

### GRAPHQL_INTROSPECTION_PROD: GraphQL introspection enabled in production

**Severity**: HIGH | **Category**: graphql

Disable GraphQL introspection in production to prevent schema exposure.

**What it catches:**
- Introspection enabled in production
- Schema exposed publicly
- Security risk

**How to fix:**
- Disable introspection in production
- Use environment variable
- Limit to development

**Recommendation**: Disable introspection in production
**Library**: Apollo Server

**Applies to**: All frameworks
**File Extensions**: .ts, .js

**Source**: `src/rules/data/graphql.json`

---

### GRAPHQL_MUTATION_RETURN: Mutation without payload type

**Severity**: LOW | **Category**: graphql

Return structured payload types from mutations for better type safety.

**What it catches:**
- Mutation returns scalar
- No structured response
- Hard to extend

**How to fix:**
- Use payload types
- Return user, success, errors
- Improve type safety

**Recommendation**: Use payload types for mutations
**Library**: GraphQL

**Applies to**: All frameworks
**File Extensions**: .graphql, .gql, .ts

**Source**: `src/rules/data/graphql.json`

---

### GRAPHQL_N_PLUS_ONE: GraphQL N+1 query problem

**Severity**: HIGH | **Category**: graphql

N+1 queries occur when resolvers fetch related data individually. Use DataLoader to batch requests.

**What it catches:**
- N+1 query in GraphQL resolvers
- Multiple database calls for related data
- Performance issues

**How to fix:**
- Use DataLoader for batching
- Batch database queries
- Optimize resolvers

**Recommendation**: Use DataLoader for batch queries
**Library**: dataloader

**Applies to**: All frameworks
**File Extensions**: .graphql, .gql, .ts, .js

**Source**: `src/rules/data/graphql.json`

---

### GRAPHQL_NO_CACHING: Missing GraphQL response caching

**Severity**: MEDIUM | **Category**: graphql

GraphQL queries can benefit from caching to reduce server load.

**What it catches:**
- No response caching
- Repeated queries hit database
- Server overload

**How to fix:**
- Add response caching
- Use Redis cache
- Cache query results

**Recommendation**: Add response caching
**Library**: apollo-server-cache-redis

**Applies to**: All frameworks
**File Extensions**: .graphql, .gql, .ts

**Source**: `src/rules/data/graphql.json`

---

### GRAPHQL_NO_INPUT_TYPE: Multiple arguments instead of Input type

**Severity**: LOW | **Category**: graphql

Use GraphQL Input types for mutations with multiple arguments.

**What it catches:**
- Multiple arguments without Input type
- Hard to maintain
- No reusability

**How to fix:**
- Create Input types
- Group related arguments
- Improve schema

**Recommendation**: Use Input types for complex arguments
**Library**: GraphQL

**Applies to**: All frameworks
**File Extensions**: .graphql, .gql, .ts

**Source**: `src/rules/data/graphql.json`

---

### GRAPHQL_NO_VARIABLES: Query variables not used

**Severity**: LOW | **Category**: graphql

Hardcoded values in queries reduce cacheability and allow injection.

**What it catches:**
- Hardcoded values in queries
- Reduced cacheability
- Potential injection

**How to fix:**
- Use query variables
- Parameterize queries
- Improve caching

**Recommendation**: Use query variables
**Library**: GraphQL

**Applies to**: All frameworks
**File Extensions**: .graphql, .gql, .ts

**Source**: `src/rules/data/graphql.json`

---

### GRAPHQL_QUERY_DEPTH: Missing query depth limiting

**Severity**: MEDIUM | **Category**: graphql

Unlimited query depth can cause denial of service. Add max depth validation.

**What it catches:**
- No query depth limiting
- DoS via deep queries
- Server overload risk

**How to fix:**
- Add graphql-depth-limit
- Set max depth
- Block expensive queries

**Recommendation**: Add query depth limiting
**Library**: graphql-depth-limit

**Applies to**: All frameworks
**File Extensions**: .ts, .js, .json

**Source**: `src/rules/data/graphql.json`

---

## Graphql-subscriptions

### GQL_SUB_NO_AUTH: GraphQL subscriptions not authenticated

**Severity**: CRITICAL | **Category**: graphql-subscriptions

Subscriptions should require authentication like queries/mutations.

**What it catches:**
- Unauthenticated connections
- Anyone can subscribe
- Security issues

**How to fix:**
- Add auth to subscription resolvers
- Validate tokens on connection
- Check permissions

**Recommendation**: Authenticate subscriptions
**Library**: Apollo Server, graphql-ws

**Applies to**: All frameworks
**File Extensions**: .ts, .js, .graphql, .gql

**Source**: `src/rules/data/graphql-subscriptions.json`

---

### GQL_SUB_NO_RATE_LIMIT: GraphQL subscriptions missing rate limit

**Severity**: MEDIUM | **Category**: graphql-subscriptions

Limit concurrent subscriptions per user to prevent abuse.

**What it catches:**
- Many concurrent connections
- Server overload
- Resource exhaustion

**How to fix:**
- Add connection limits
- Throttle per user
- Monitor connections

**Recommendation**: Limit subscription connections
**Library**: graphql-ws rate limit

**Applies to**: All frameworks
**File Extensions**: .ts, .js

**Source**: `src/rules/data/graphql-subscriptions.json`

---

### GQL_SUB_NO_VALIDATION: Subscription payload not validated

**Severity**: MEDIUM | **Category**: graphql-subscriptions

Validate connection params and payload data.

**What it catches:**
- Invalid data processed
- No type safety
- Potential errors

**How to fix:**
- Validate connection params
- Use schema validation
- Check payload data

**Recommendation**: Validate subscription payloads
**Library**: graphql-ws

**Applies to**: All frameworks
**File Extensions**: .ts, .js, .graphql, .gql

**Source**: `src/rules/data/graphql-subscriptions.json`

---

## I18n

### I18N_HARDCODED_STRING: Hardcoded string instead of i18n

**Severity**: MEDIUM | **Category**: i18n

Hardcoded strings prevent localization. Use translation functions.

**What it catches:**
- Hardcoded UI strings
- Can't translate app
- Single language only

**How to fix:**
- Use t() or translate function
- Create translation files
- Support multiple languages

**Recommendation**: Use i18n for strings
**Library**: i18next, vue-i18n, ngx-translate

**Applies to**: react, vue, svelte, angular
**File Extensions**: .tsx, .jsx

**Source**: `src/rules/data/i18n.json`

---

### I18N_NO_DATE_FORMAT: Using hardcoded date formats

**Severity**: LOW | **Category**: i18n

Date formats vary by locale. Use Intl.DateTimeFormat.

**What it catches:**
- Wrong date format per locale
- Confusing for users
- Hard to read dates

**How to fix:**
- Use Intl.DateTimeFormat
- Pass locale to formatter
- Use date-fns or dayjs

**Recommendation**: Use locale-aware date formatting
**Library**: Intl, date-fns, dayjs

**Applies to**: All frameworks
**File Extensions**: .ts, .js, .tsx, .jsx

**Source**: `src/rules/data/i18n.json`

---

### I18N_NO_FALLBACK: Missing fallback language

**Severity**: MEDIUM | **Category**: i18n

Configure fallback when translation is missing.

**What it catches:**
- Missing translations break UI
- No default language
- Blank strings shown

**How to fix:**
- Set fallbackLng config
- Use common language as fallback
- Handle missing keys

**Recommendation**: Set fallback language
**Library**: i18next

**Applies to**: All frameworks
**File Extensions**: .ts, .js, .json

**Source**: `src/rules/data/i18n.json`

---

### I18N_NO_LOCALE: Missing locale configuration

**Severity**: MEDIUM | **Category**: i18n

Define supported locales for the application.

**What it catches:**
- Undefined supported languages
- Can't filter languages
- Inconsistent behavior

**How to fix:**
- Define supportedLocales
- Configure fallback locale
- Validate locale codes

**Recommendation**: Configure supported locales
**Library**: i18next

**Applies to**: All frameworks
**File Extensions**: .ts, .js, .json

**Source**: `src/rules/data/i18n.json`

---

### I18N_NO_NUMBER_FORMAT: Using hardcoded number formats

**Severity**: LOW | **Category**: i18n

Number formats (decimal separators) vary by locale.

**What it catches:**
- Wrong number format per locale
- Wrong decimal separators
- Confusing for users

**How to fix:**
- Use Intl.NumberFormat
- Pass locale to formatter
- Format numbers properly

**Recommendation**: Use locale-aware number formatting
**Library**: Intl.NumberFormat

**Applies to**: All frameworks
**File Extensions**: .ts, .js, .tsx, .jsx

**Source**: `src/rules/data/i18n.json`

---

### I18N_PLURAL_NOTES: Plural forms not handled

**Severity**: LOW | **Category**: i18n

Different languages have different plural rules.

**What it catches:**
- Incorrect plural forms shown
- Grammar errors in translations
- Wrong count displayed

**How to fix:**
- Add plural forms to keys
- Use count variable
- Define all plural forms

**Recommendation**: Handle plural forms
**Library**: i18next plural

**Applies to**: All frameworks
**File Extensions**: .json, .ts

**Source**: `src/rules/data/i18n.json`

---

## Kubernetes

### K8S_NO_HPA: No HorizontalPodAutoscaler

**Severity**: MEDIUM | **Category**: kubernetes

HPA enables automatic scaling based on load.

**What it catches:**
- No auto-scaling
- Can't handle traffic spikes
- Manual scaling only

**How to fix:**
- Create HorizontalPodAutoscaler
- Set CPU/memory targets
- Configure min/max replicas

**Recommendation**: Add HPA for scaling
**Library**: Kubernetes HPA

**Applies to**: All frameworks
**File Extensions**: yaml, yml

**Source**: `src/rules/data/kubernetes.json`

---

### K8S_NO_LIVENESS: Missing liveness probe

**Severity**: HIGH | **Category**: kubernetes

Liveness probes detect hung containers that need restart.

**What it catches:**
- Hung containers not restarted
- No recovery mechanism
- App stuck in bad state

**How to fix:**
- Add livenessProbe endpoint
- Configure initial delay
- Set failure threshold

**Recommendation**: Add liveness probe
**Library**: Kubernetes

**Applies to**: All frameworks
**File Extensions**: yaml, yml

**Source**: `src/rules/data/kubernetes.json`

---

### K8S_NO_POD_DISRUPTION_BUDGET: Missing PodDisruptionBudget

**Severity**: MEDIUM | **Category**: kubernetes

Ensure minimum replicas during voluntary disruptions.

**What it catches:**
- All pods down during update
- Service unavailable
- Downtime during deploys

**How to fix:**
- Create PodDisruptionBudget
- Set min available replicas
- Allow rolling updates

**Recommendation**: Add PodDisruptionBudget
**Library**: Kubernetes PDB

**Applies to**: All frameworks
**File Extensions**: yaml, yml

**Source**: `src/rules/data/kubernetes.json`

---

### K8S_NO_READINESS: Missing readiness probe

**Severity**: HIGH | **Category**: kubernetes

Readiness probes prevent traffic to unhealthy pods.

**What it catches:**
- Traffic sent to unhealthy pods
- Failed requests
- Poor user experience

**How to fix:**
- Add readinessProbe endpoint
- Check dependencies in probe
- Return 200 when ready

**Recommendation**: Add readiness probe
**Library**: Kubernetes

**Applies to**: All frameworks
**File Extensions**: yaml, yml

**Source**: `src/rules/data/kubernetes.json`

---

### K8S_NO_RESOURCES: Missing resource limits

**Severity**: MEDIUM | **Category**: kubernetes

Prevent resource starvation and set QoS class.

**What it catches:**
- No resource limits set
- Resource starvation
- No QoS class

**How to fix:**
- Set requests and limits
- Configure CPU and memory
- Enable QoS guarantee

**Recommendation**: Set resource limits and requests
**Library**: Kubernetes resources

**Applies to**: All frameworks
**File Extensions**: yaml, yml

**Source**: `src/rules/data/kubernetes.json`

---

### K8S_NO_SECURITY_CONTEXT: Missing security context

**Severity**: HIGH | **Category**: kubernetes

Run containers as non-root with read-only filesystem.

**What it catches:**
- Running as root user
- Writable filesystem
- Security vulnerabilities

**How to fix:**
- Set securityContext
- RunAsNonRoot: true
- ReadOnlyRootFilesystem: true

**Recommendation**: Set security context
**Library**: Kubernetes security

**Applies to**: All frameworks
**File Extensions**: yaml, yml

**Source**: `src/rules/data/kubernetes.json`

---

## Maintainability

### MAIN_COMPLEX_FUNCTION: Complex function

**Severity**: MEDIUM | **Category**: maintainability

Functions should be simple and focused on a single task.

**What it catches:**
- Function does too much
- Hard to understand
- Difficult to test

**How to fix:**
- Extract to smaller functions
- Follow single responsibility
- Reduce function size

**Recommendation**: Simplify complex functions
**Library**: Refactoring

**Applies to**: All frameworks
**File Extensions**: .ts, .js

**Source**: `src/rules/data/maintainability.json`

---

### MAIN_DATA_CLUMP: Data clump

**Severity**: LOW | **Category**: maintainability

Groups of variables passed together should be extracted into their own class or object.

**What it catches:**
- Same variables passed together
- Duplicated parameter lists
- Hard to maintain

**How to fix:**
- Extract to interface or type
- Create parameter object
- Group related data

**Recommendation**: Extract data clumps
**Library**: Refactoring

**Applies to**: All frameworks
**File Extensions**: .ts

**Source**: `src/rules/data/maintainability.json`

---

### MAIN_DEEP_NESTING: Deeply nested code

**Severity**: MEDIUM | **Category**: maintainability

Deeply nested code is hard to read and maintain.

**What it catches:**
- Too many nested levels
- Hard to follow logic
- Complex to maintain

**How to fix:**
- Use early returns
- Extract to functions
- Simplify conditionals

**Recommendation**: Reduce nesting
**Library**: Refactoring

**Applies to**: All frameworks
**File Extensions**: .ts, .js

**Source**: `src/rules/data/maintainability.json`

---

### MAIN_DRY_VIOLATION: Potential DRY violation

**Severity**: LOW | **Category**: maintainability

Potential DRY violation - duplicate code chunks found across multiple files. Extract to shared utility.

**What it catches:**
- Code repeated multiple times across files
- Duplicate code chunks that should be extracted
- DRY principle violated
- Hard to maintain changes

**How to fix:**
- Extract to reusable function
- Create utility functions
- Reuse existing code

**Recommendation**: Extract repeated code
**Library**: Refactoring

**Applies to**: All frameworks
**File Extensions**: .ts, .js

**Source**: `src/rules/data/maintainability.json`

---

### MAIN_FEATURE_ENVY: Feature envy

**Severity**: LOW | **Category**: maintainability

Functions that access too much data from other objects should be moved closer to that data.

**What it catches:**
- Function uses too much external data
- Strong coupling
- Hard to reuse

**How to fix:**
- Move method to the class it uses most
- Pass needed data only
- Reduce coupling

**Recommendation**: Move code to data
**Library**: Refactoring

**Applies to**: All frameworks
**File Extensions**: .ts, .js

**Source**: `src/rules/data/maintainability.json`

---

### MAIN_GOD_OBJECT: God object

**Severity**: HIGH | **Category**: maintainability

Objects that do too much should be split into smaller, focused objects.

**What it catches:**
- Class doing too much
- Hard to maintain
- Too many responsibilities

**How to fix:**
- Split into smaller classes
- Follow single responsibility
- Use composition

**Recommendation**: Split god objects
**Library**: SOLID principles

**Applies to**: All frameworks
**File Extensions**: .ts, .js

**Source**: `src/rules/data/maintainability.json`

---

### MAIN_HARDCODED_SQL: Hardcoded SQL Queries

**Severity**: INFO | **Category**: maintainability

Hardcoded SQL queries reduce maintainability. Use query builders.

**What it catches:**
- SQL queries embedded in code
- Hard to change schema
- SQL injection risks

**How to fix:**
- Use Prisma or Drizzle ORM
- Use query builder like Knex
- Parameterize queries

**Recommendation**: Use query builders or ORMs
**Library**: Knex, Prisma

**Applies to**: All frameworks


**Source**: `src/rules/data/maintainability.json`

---

### MAIN_HARDCODED_VALUES: Hardcoded values

**Severity**: LOW | **Category**: maintainability

Hardcoded values should be extracted to configuration files.

**What it catches:**
- Values hardcoded in code
- Requires code changes to update
- No environment-specific config

**How to fix:**
- Move to config file
- Use environment variables
- Create config object

**Recommendation**: Extract configuration
**Library**: Configuration

**Applies to**: All frameworks
**File Extensions**: .ts, .js

**Source**: `src/rules/data/maintainability.json`

---

### MAIN_LONG_FILE: Long file

**Severity**: MEDIUM | **Category**: maintainability

Files should be kept under 500 lines for maintainability.

**What it catches:**
- Files too large
- Hard to navigate
- Difficult to maintain

**How to fix:**
- Split into multiple files
- Extract to separate modules
- Organize by feature

**Recommendation**: Split long files
**Library**: Code organization

**Applies to**: All frameworks
**File Extensions**: .ts, .js

**Source**: `src/rules/data/maintainability.json`

---

### MAIN_MAGIC_NUMBERS: Magic numbers in code

**Severity**: INFO | **Category**: maintainability

Magic numbers reduce readability. Use named constants instead.

**What it catches:**
- Numbers without explanation
- Hard to understand code
- Difficult to update

**How to fix:**
- Create named constants
- Use enums for related values
- Document what numbers mean

**Recommendation**: Use constants
**Library**: Constants

**Applies to**: All frameworks


**Source**: `src/rules/data/maintainability.json`

---

### MAIN_MANUAL_FORM_STATE: Manual useState for form fields

**Severity**: MEDIUM | **Category**: maintainability

Manual useState for each form field reduces maintainability. Use form libraries.

**What it catches:**
- Many useState for each field
- Hard to manage validation
- Boilerplate code

**How to fix:**
- Use React Hook Form or Formik
- Use form library for validation
- Simplify form state management

**Recommendation**: Use form libraries
**Library**: React Hook Form, Formik

**Applies to**: react, vue, svelte


**Source**: `src/rules/data/maintainability.json`

---

## Migrations

### MIGRATION_NO_BACKUP: Risky operation without backup

**Severity**: HIGH | **Category**: migrations

DROP TABLE, TRUNCATE, DELETE without WHERE need backups.

**What it catches:**
- Data loss
- No recovery option
- Permanent deletion

**How to fix:**
- Backup before destructive ops
- Test on staging first
- Have recovery plan

**Recommendation**: Backup before destructive changes
**Library**: Database backup

**Applies to**: All frameworks
**File Extensions**: .sql

**Source**: `src/rules/data/migrations.json`

---

### MIGRATION_NO_IDX_CONCURRENTLY: Index created without CONCURRENTLY

**Severity**: MEDIUM | **Category**: migrations

CONCURRENTLY creates indexes without locking writes.

**What it catches:**
- Table locks during index
- Production downtime
- Failed deployments

**How to fix:**
- Use CONCURRENTLY keyword
- Schedule during low traffic
- Test on staging first

**Recommendation**: Use CONCURRENTLY for production indexes
**Library**: PostgreSQL

**Applies to**: All frameworks
**File Extensions**: .sql

**Source**: `src/rules/data/migrations.json`

---

### MIGRATION_NO_ROLLBACK: Migration without rollback

**Severity**: HIGH | **Category**: migrations

Always provide up() and down() or use .sql with reverse.

**What it catches:**
- Can't revert changes
- Database stuck
- Failed deployments

**How to fix:**
- Write down() method
- Add reversible SQL
- Test rollback first

**Recommendation**: Write reversible migrations
**Library**: Migration framework

**Applies to**: All frameworks
**File Extensions**: ts, js, .sql

**Source**: `src/rules/data/migrations.json`

---

### MIGRATION_NO_SCHEMA: Migration not using schema

**Severity**: MEDIUM | **Category**: migrations

Group objects in schemas for better organization.

**What it catches:**
- No schema organization
- Flat namespace
- Hard to manage

**How to fix:**
- Create schemas for groups
- Set schema in migrations
- Organize by feature

**Recommendation**: Use database schema
**Library**: PostgreSQL, SQL Server

**Applies to**: All frameworks
**File Extensions**: .sql, ts, js

**Source**: `src/rules/data/migrations.json`

---

### MIGRATION_NO_SEED: Missing seed data

**Severity**: LOW | **Category**: migrations

Seed data ensures consistent reference data across environments.

**What it catches:**
- Missing reference data
- Inconsistent environments
- Failed deployments

**How to fix:**
- Create seed files
- Seed reference tables
- Run seeds after migrate

**Recommendation**: Add seed data for reference tables
**Library**: Knex seed, Prisma seed

**Applies to**: All frameworks
**File Extensions**: ts, js, .sql

**Source**: `src/rules/data/migrations.json`

---

### MIGRATION_NO_TIMESTAMP: Migration files not timestamped

**Severity**: LOW | **Category**: migrations

Timestamp-based names ensure consistent ordering across environments.

**What it catches:**
- Migration order unclear
- Inconsistent ordering
- Deployment conflicts

**How to fix:**
- Use timestamp prefixes
- Use UUID-based names
- Configure migration naming

**Recommendation**: Use timestamped migrations
**Library**: Knex, Prisma, TypeORM

**Applies to**: All frameworks
**File Extensions**: ts, js, .sql

**Source**: `src/rules/data/migrations.json`

---

## Monitoring

### MON_NO_ALERTING: Missing alerting configuration

**Severity**: MEDIUM | **Category**: monitoring

Set up alerts for critical metrics and errors.

**What it catches:**
- No notifications for outages
- Errors not responded to
- Downtime goes unnoticed

**How to fix:**
- Set up alerts in Prometheus/Grafana
- Integrate PagerDuty or OpsGenie
- Define alert thresholds

**Recommendation**: Configure alerting
**Library**: PagerDuty, OpsGenie

**Applies to**: All frameworks
**File Extensions**: .ts, .js, .yaml, .yml

**Source**: `src/rules/data/monitoring.json`

---

### MON_NO_ERROR_TRACKING: Missing error tracking

**Severity**: HIGH | **Category**: monitoring

Use Sentry, Bugsnag, or similar for error monitoring.

**What it catches:**
- Errors go unnoticed in production
- No stack traces for debugging
- Can't track error frequency

**How to fix:**
- Integrate Sentry or Bugsnag
- Capture uncaught exceptions
- Add user context to errors

**Recommendation**: Add error tracking
**Library**: Sentry, Bugsnag

**Applies to**: All frameworks
**File Extensions**: .ts, .js

**Source**: `src/rules/data/monitoring.json`

---

### MON_NO_GRACEFUL_SHUTDOWN: Missing graceful shutdown

**Severity**: HIGH | **Category**: monitoring

Close connections and finish processing before exiting.

**What it catches:**
- Requests fail during shutdown
- Database connections leak
- In-flight requests broken

**How to fix:**
- Listen for SIGTERM/SIGINT signals
- Stop accepting new requests
- Close database connections gracefully

**Recommendation**: Handle SIGTERM gracefully
**Library**: Process events

**Applies to**: express, fastify, nodejs
**File Extensions**: .ts, .js

**Source**: `src/rules/data/monitoring.json`

---

### MON_NO_HEALTH_CHECK: Missing health check endpoint

**Severity**: HIGH | **Category**: monitoring

Health checks are required for container orchestration (K8s, ECS).

**What it catches:**
- K8s can't detect unhealthy pods
- Load balancer sends traffic to failed instances
- No readiness detection

**How to fix:**
- Create /health endpoint for liveness checks
- Create /ready endpoint for readiness
- Check dependencies in readiness check

**Recommendation**: Add health check endpoint
**Library**: /health, /ready

**Applies to**: express, fastify, nextjs, nuxt
**File Extensions**: .ts, .js

**Source**: `src/rules/data/monitoring.json`

---

### MON_NO_METRICS: Missing metrics endpoint

**Severity**: MEDIUM | **Category**: monitoring

Expose metrics for monitoring and alerting.

**What it catches:**
- No visibility into app performance
- Can't create dashboards
- Missing alerting data

**How to fix:**
- Add /metrics endpoint with prom-client
- Track request counts, durations, errors
- Export in Prometheus format

**Recommendation**: Add Prometheus metrics
**Library**: prom-client, @opentelemetry

**Applies to**: All frameworks
**File Extensions**: .ts, .js

**Source**: `src/rules/data/monitoring.json`

---

### MON_NO_UPTRACE: Missing distributed tracing

**Severity**: MEDIUM | **Category**: monitoring

Trace requests across services for debugging.

**What it catches:**
- Can't trace requests across services
- Hard to debug distributed issues
- No request correlation

**How to fix:**
- Add OpenTelemetry SDK
- Propagate trace context headers
- Export to Jaeger or Zipkin

**Recommendation**: Add distributed tracing
**Library**: OpenTelemetry, Jaeger, Zipkin

**Applies to**: All frameworks
**File Extensions**: .ts, .js

**Source**: `src/rules/data/monitoring.json`

---

## Payments

### PAY_NO_3DS: 3D Secure not implemented

**Severity**: HIGH | **Category**: payments

3D Secure is required for SCA compliance in EU.

**What it catches:**
- Not SCA compliant
- Payments rejected
- Legal issues

**How to fix:**
- Enable 3D Secure
- Handle authentication flow
- Configure payment intents

**Recommendation**: Implement 3D Secure
**Library**: Stripe 3D Secure

**Applies to**: All frameworks
**File Extensions**: .ts, .js

**Source**: `src/rules/data/payments.json`

---

### PAY_NO_IDEMPOTENCY: Payment request without idempotency

**Severity**: CRITICAL | **Category**: payments

Prevent duplicate charges by using idempotency keys for payment requests.

**What it catches:**
- Duplicate charges
- Customer charged twice
- Financial loss

**How to fix:**
- Add idempotency key to requests
- Use unique key per transaction
- Handle retry safely

**Recommendation**: Use idempotency keys
**Library**: Stripe idempotency

**Applies to**: All frameworks
**File Extensions**: .ts, .js

**Source**: `src/rules/data/payments.json`

---

### PAY_NO_REFUND: Missing refund functionality

**Severity**: MEDIUM | **Category**: payments

Have a clear refund process for returns and disputes.

**What it catches:**
- No refund process
- Customer complaints
- Disputes and chargebacks

**How to fix:**
- Implement refund API endpoint
- Handle partial refunds
- Track refund status

**Recommendation**: Implement refund process
**Library**: Stripe refunds

**Applies to**: All frameworks
**File Extensions**: .ts, .js

**Source**: `src/rules/data/payments.json`

---

### PAY_NO_WEBHOOK_RETRY: Webhook handler missing retry logic

**Severity**: MEDIUM | **Category**: payments

Payment providers retry failed webhooks. Files with webhook/stripe/payment patterns should handle duplicates. Note: Files without payment-related patterns are ignored.

**What it catches:**
- Webhook handlers without retry/idempotency handling
- Missed payment events
- Duplicate processing

**How to fix:**
- Check event ID for duplicates
- Store processed events
- Handle idempotently

**Recommendation**: Handle webhook retries
**Library**: Webhook idempotency

**Applies to**: All frameworks
**File Extensions**: .ts, .js

**Source**: `src/rules/data/payments.json`

---

### PAY_NO_WEBHOOK_VERIFY: Webhook not verified

**Severity**: CRITICAL | **Category**: payments

Always verify webhook signatures to prevent spoofed payment events.

**What it catches:**
- Fake webhook events
- Spoofed payment events
- Financial fraud

**How to fix:**
- Verify webhook signature
- Use provider's verification lib
- Validate event payload

**Recommendation**: Verify webhook signatures
**Library**: Stripe, PayPal webhooks

**Applies to**: All frameworks
**File Extensions**: .ts, .js

**Source**: `src/rules/data/payments.json`

---

### PAY_SANDBOX_PROD: Sandbox API keys in production

**Severity**: CRITICAL | **Category**: payments

Sandbox keys won't process real payments.

**What it catches:**
- Sandbox keys in production
- Payments don't process
- Real money lost

**How to fix:**
- Use live keys in production
- Check environment config
- Verify keys match env

**Recommendation**: Use production keys only in prod
**Library**: Environment config

**Applies to**: All frameworks
**File Extensions**: .ts, .js, .env

**Source**: `src/rules/data/payments.json`

---

### PAY_STORED_CARD: Storing card details directly

**Severity**: CRITICAL | **Category**: payments

Never store card details. Use provider tokenization (Stripe tokens, etc.)

**What it catches:**
- Storing card data
- PCI DSS violation
- Security breach risk

**How to fix:**
- Use Stripe Elements or similar
- Store only token, not card data
- Never touch raw card data

**Recommendation**: Use payment provider tokenization
**Library**: Stripe Elements, payment tokens

**Applies to**: All frameworks
**File Extensions**: .ts, .js, .tsx, .jsx

**Source**: `src/rules/data/payments.json`

---

## Performance

### AI_CLIENT_BUNDLE_BLOAT: Server-only imports in client code

**Severity**: MEDIUM | **Category**: performance

Server-only modules imported in client code increase bundle size. Use dynamic imports or move server logic.

**What it catches:**
- Server-only modules in client bundle
- Increased bundle size
- fs, path, crypto in browser

**How to fix:**
- Use dynamic imports for server modules
- Move server logic to server components
- Use 'server only' directive

**Recommendation**: Avoid server-only imports in client code
**Library**: Next.js

**Applies to**: nextjs


**Source**: `src/rules/data/ai-patterns.json`

---

### ANGULAR_DETECT_CHANGE: Manual change detection

**Severity**: MEDIUM | **Category**: performance

Manual change detection can cause performance issues. Use OnPush and async pipe.

**What it catches:**
- Manual change detection calls
- Performance issues
- Unnecessary re-renders

**How to fix:**
- Use OnPush change detection
- Use async pipe
- Avoid detectChanges() calls

**Recommendation**: Avoid manual change detection
**Library**: Angular

**Applies to**: angular


**Source**: `src/rules/data/angular.json`

---

### ANGULAR_PIPE_PURE: Impure pipe with expensive computation

**Severity**: MEDIUM | **Category**: performance

Pipes should be pure by default for performance.

**What it catches:**
- Impure pipe with expensive computation
- Runs on every change detection
- Performance issues

**How to fix:**
- Make pipe pure if possible
- Cache results in impure pipe
- Use OnPush change detection

**Recommendation**: Mark pure pipes
**Library**: Angular

**Applies to**: angular


**Source**: `src/rules/data/angular.json`

---

### ANGULAR_TEMPLATE_CHANGE: Method call in template

**Severity**: MEDIUM | **Category**: performance

Method calls in templates run on every change detection. Use pipes or computed properties.

**What it catches:**
- Method calls in template
- Runs on every change detection
- Performance issues

**How to fix:**
- Use pure pipes
- Use computed properties
- Move logic to component

**Recommendation**: Avoid method calls in templates
**Library**: Angular

**Applies to**: angular


**Source**: `src/rules/data/angular.json`

---

### ASTRO_CLIENT_LOAD: Hydrating everything

**Severity**: LOW | **Category**: performance

Only hydrate components that need interactivity. Avoid client:load on static content.

**What it catches:**
- Unnecessary client hydration
- Larger bundle size
- Slower initial load

**How to fix:**
- Use client directives only when needed
- Avoid client:load on static content
- Use client:visible for below-fold content

**Recommendation**: Use client directives only when needed
**Library**: Astro

**Applies to**: astro


**Source**: `src/rules/data/astro.json`

---

### ASTRO_DIRECTIVE_WRONG: Wrong hydration directive

**Severity**: MEDIUM | **Category**: performance

Choose appropriate directive: client:load, client:visible, client:idle, etc.

**What it catches:**
- Wrong hydration directive used
- Inefficient loading
- Poor performance

**How to fix:**
- Use client:visible for below-fold content
- Use client:idle for non-critical
- Use client:load only for above-fold

**Recommendation**: Use correct hydration directive
**Library**: Astro

**Applies to**: astro


**Source**: `src/rules/data/astro.json`

---

### ASTRO_NO_PRERENDER: Missing prerender

**Severity**: MEDIUM | **Category**: performance

Static pages should use prerender for better performance.

**What it catches:**
- Static pages not prerendered
- Server-side rendering on each request
- Wasted resources

**How to fix:**
- Add prerender to static pages
- Use static adapter
- Pre-generate pages at build time

**Recommendation**: Add prerender for static pages
**Library**: Astro

**Applies to**: astro


**Source**: `src/rules/data/astro.json`

---

### DB_EAGER_LOAD: Eager Loading Everything

**Severity**: MEDIUM | **Category**: performance

Eager loading all relations causes performance issues. Load only needed relations.

**What it catches:**
- Eager loading all relations
- Unnecessary data fetched
- Performance issues

**How to fix:**
- Load only needed relations
- Use lazy loading
- Select specific fields

**Recommendation**: Avoid eager loading everything
**Library**: ORM

**Applies to**: nextjs, nuxt, remix
**File Extensions**: .ts, .js

**Source**: `src/rules/data/database.json`

---

### DB_MISSING_INDEX: Missing Database Index

**Severity**: MEDIUM | **Category**: performance

Missing index on frequently queried columns.

**What it catches:**
- Missing database index
- Slow queries
- Full table scans

**How to fix:**
- Add index to frequently queried columns
- Use @@index in Prisma
- Analyze query patterns

**Recommendation**: Add database index
**Library**: Database

**Applies to**: nextjs, nuxt, express, fastify, remix
**File Extensions**: .ts, .prisma

**Source**: `src/rules/data/database.json`

---

### DB_N_PLUS_1: N+1 Query Problem

**Severity**: HIGH | **Category**: performance

Use eager loading or JOINs to avoid N+1 queries.

**What it catches:**
- N+1 query problem
- Multiple database calls in loop
- Performance issues

**How to fix:**
- Use eager loading
- Use JOINs
- Batch queries

**Recommendation**: Fix N+1 query problem
**Library**: Prisma, Drizzle

**Applies to**: All frameworks
**File Extensions**: .ts, .js

**Source**: `src/rules/data/database.json`

---

### DB_PRISMA_INCLUDE_ALL: Prisma include() without where

**Severity**: MEDIUM | **Category**: performance

include() without where loads all relations. Add filtering.

**What it catches:**
- include() without where
- Loads all related records
- Performance issues

**How to fix:**
- Add where clause to include
- Filter related records
- Limit fetched data

**Recommendation**: Prisma include without where
**Library**: Prisma

**Applies to**: nextjs, nuxt, remix
**File Extensions**: .ts

**Source**: `src/rules/data/database.json`

---

### MOBILE_BATTERY_DRAIN: Background processes may drain battery

**Severity**: LOW | **Category**: performance

Avoid unnecessary background processing to preserve battery.

**What it catches:**
- Battery drains quickly
- Background timers running unnecessarily
- Poor battery life experience

**How to fix:**
- Use Page Visibility API
- Pause animations when hidden
- Clear intervals on page hide

**Recommendation**: Optimize background processes
**Library**: Performance

**Applies to**: All frameworks


**Source**: `src/rules/data/mobile.json`

---

### NEXT_CACHE_DYNAMIC: Dynamic data without cache config

**Severity**: LOW | **Category**: performance

Dynamic data should have explicit cache configuration.

**What it catches:**
- Cache strategy unclear
- Unexpected cached data
- Stale data served

**How to fix:**
- Use no-store for dynamic data
- Use revalidate for periodic updates
- Document cache strategy

**Recommendation**: Configure cache for dynamic data
**Library**: Next.js

**Applies to**: nextjs


**Source**: `src/rules/data/nextjs.json`

---

### NEXT_CLIENT_DIRECTIVE: Unnecessary 'use client' directive

**Severity**: MEDIUM | **Category**: performance

'use client' makes the component a Client Component. Use only if you need hooks or browser APIs.

**What it catches:**
- Unnecessary client-side rendering
- Larger bundle size
- Worse performance

**How to fix:**
- Remove 'use client' if hooks not needed
- Use server components by default
- Only add 'use client' where needed

**Recommendation**: Remove unnecessary 'use client' directive
**Library**: Next.js

**Applies to**: nextjs


**Source**: `src/rules/data/nextjs.json`

---

### NEXT_DYNAMIC_IMPORT: Missing dynamic imports for heavy components

**Severity**: MEDIUM | **Category**: performance

Heavy components should be lazy loaded with dynamic imports.

**What it catches:**
- Large bundle size
- Slow initial load
- Blocking JavaScript

**How to fix:**
- Use dynamic() for heavy components
- Add loading for code splitting
- Use ssr: false for client-only

**Recommendation**: Use dynamic imports for heavy components
**Library**: Next.js

**Applies to**: nextjs


**Source**: `src/rules/data/nextjs.json`

---

### NEXT_FONT_GOOGLE: Google Fonts without optimization

**Severity**: LOW | **Category**: performance

Use next/font/google for optimized font loading.

**What it catches:**
- Fonts loaded with layout shift
- Flash of unstyled text
- Blocking render

**How to fix:**
- Use next/font/google
- Use next/font/local
- Remove link tags to Google Fonts

**Recommendation**: Use next/font for Google Fonts
**Library**: next/font

**Applies to**: nextjs


**Source**: `src/rules/data/nextjs.json`

---

### NEXT_IMAGE_UNOPTIMIZED: next/image without optimization config

**Severity**: LOW | **Category**: performance

next/image should have proper optimization configuration.

**What it catches:**
- Large images sent to browser
- Slow page loads
- Poor Core Web Vitals

**How to fix:**
- Configure images in next.config.js
- Use quality prop on Image
- Configure allowed domains

**Recommendation**: Configure next/image optimization
**Library**: next/image

**Applies to**: nextjs


**Source**: `src/rules/data/nextjs.json`

---

### NEXT_LAYOUT_STATE: State in shared layout

**Severity**: MEDIUM | **Category**: performance

State in shared layouts causes all pages to re-render. Move state to client components.

**What it catches:**
- All pages re-render when state changes
- Performance issues
- Unnecessary server rendering

**How to fix:**
- Move useState to client components
- Use context providers in client components
- Keep layouts pure and server-only

**Recommendation**: Don't use state in shared layout
**Library**: Next.js

**Applies to**: nextjs


**Source**: `src/rules/data/nextjs.json`

---

### NEXT_METADATA_DYNAMIC: Dynamic metadata without generate

**Severity**: LOW | **Category**: performance

Dynamic metadata should use generateMetadata function.

**What it catches:**
- Static metadata for dynamic pages
- SEO issues
- Missing OG images

**How to fix:**
- Use generateMetadata function
- Fetch data for each page
- Return dynamic metadata object

**Recommendation**: Use generateMetadata for dynamic metadata
**Library**: Next.js

**Applies to**: nextjs


**Source**: `src/rules/data/nextjs.json`

---

### NEXT_MISSING_CACHE: fetch() without cache option

**Severity**: MEDIUM | **Category**: performance

fetch() without cache option may cause unnecessary fetches.

**What it catches:**
- Fetch runs on every request
- Unnecessary network requests
- Poor caching behavior

**How to fix:**
- Add cache: 'force-cache' for static data
- Add cache: 'no-store' for dynamic data
- Use fetch with revalidate options

**Recommendation**: Add cache option to fetch
**Library**: Next.js

**Applies to**: nextjs


**Source**: `src/rules/data/nextjs.json`

---

### PERF_BIG_BUNDLE: Large bundle size

**Severity**: MEDIUM | **Category**: performance

Large bundles hurt load time. Use dynamic imports for code splitting.

**What it catches:**
- Large JavaScript bundles
- No code splitting
- Slow initial load times

**How to fix:**
- Use dynamic imports
- Implement code splitting
- Analyze bundle with source-map-explorer

**Recommendation**: Code splitting for large bundles
**Library**: Webpack, Vite

**Applies to**: react, nextjs, vue, svelte


**Source**: `src/rules/data/performance.json`

---

### PERF_BIND_IN_RENDER: .bind() in render method

**Severity**: MEDIUM | **Category**: performance

Using .bind() in render creates new functions on each render.

**What it catches:**
- .bind() in JSX
- New function every render
- Child re-renders

**How to fix:**
- Use arrow functions in class
- Bind in constructor
- Use useCallback

**Recommendation**: Avoid .bind() in render
**Library**: React

**Applies to**: react


**Source**: `src/rules/data/performance.json`

---

### PERF_CACHING: Missing caching for expensive operations

**Severity**: MEDIUM | **Category**: performance

Expensive operations should be cached.

**What it catches:**
- No caching implemented
- Repeated expensive calls
- Database hits every request

**How to fix:**
- Add memoization
- Use Redis for distributed caching
- Cache expensive computations

**Recommendation**: Add caching for expensive operations
**Library**: Performance

**Applies to**: All frameworks


**Source**: `src/rules/data/performance.json`

---

### PERF_CLASS_DECORATOR: Class decorator impact

**Severity**: LOW | **Category**: performance

Decorators can impact performance. Use them carefully.

**What it catches:**
- Decorator overhead
- Reflection usage
- Runtime metadata

**How to fix:**
- Minimize decorator usage
- Consider functional approach
- Benchmark decorator impact

**Recommendation**: Consider decorator impact
**Library**: TypeScript

**Applies to**: All frameworks
**File Extensions**: .ts

**Source**: `src/rules/data/performance.json`

---

### PERF_DEBOUNCE: Undebounced event handler

**Severity**: MEDIUM | **Category**: performance

Frequent events like scroll/resize should be debounced.

**What it catches:**
- Events firing too often
- No debounce on scroll/resize
- Excessive handler calls

**How to fix:**
- Add lodash debounce
- Throttle frequent events
- Use useDebouncedCallback

**Recommendation**: Debounce frequent events
**Library**: lodash.debounce

**Applies to**: All frameworks


**Source**: `src/rules/data/performance.json`

---

### PERF_DEPENDENCIES: Heavy dependency detected

**Severity**: LOW | **Category**: performance

Heavy dependencies impact bundle size. Consider alternatives.

**What it catches:**
- Large dependencies
- Bundle bloat
- Slow installs

**How to fix:**
- Check bundlephobia
- Use lighter alternatives
- Tree-shake dependencies

**Recommendation**: Check for heavy dependencies
**Library**: Bundle analysis

**Applies to**: All frameworks
**File Extensions**: .json, .js

**Source**: `src/rules/data/performance.json`

---

### PERF_DUPLICATE_DEP: Duplicate dependencies detected

**Severity**: MEDIUM | **Category**: performance

Duplicate dependencies increase bundle size. Use dedupe.

**What it catches:**
- Same package multiple versions
- Increased node_modules
- Bundle duplication

**How to fix:**
- Run npm dedupe
- Use yarn resolutions
- Use pnpm

**Recommendation**: Remove duplicate dependencies
**Library**: npm

**Applies to**: All frameworks


**Source**: `src/rules/data/performance.json`

---

### PERF_EVENT_LISTENER_LEAK: Event listener without cleanup

**Severity**: HIGH | **Category**: performance

Event listeners should be removed when no longer needed to prevent memory leaks.

**What it catches:**
- addEventListener without removeEventListener
- Memory leaks from event listeners
- Detached DOM elements with listeners

**How to fix:**
- Add removeEventListener in cleanup
- Use AbortController for addEventListener
- Remove listeners on component unmount (React)

**Recommendation**: Clean up event listeners
**Library**: Event handling

**Applies to**: All frameworks


**Source**: `src/rules/data/performance.json`

---

### PERF_EXCESSIVE_LOGGING: Excessive logging detected

**Severity**: LOW | **Category**: performance

Excessive logging can impact performance.

**What it catches:**
- Too much console logging
- Debug statements in code
- Performance impact from logs

**How to fix:**
- Remove debug logs in production
- Use proper log levels
- Configure logging per environment

**Recommendation**: Reduce logging in production
**Library**: Logging

**Applies to**: All frameworks


**Source**: `src/rules/data/performance.json`

---

### PERF_EXPENSIVE_RENDER: Expensive computation in render

**Severity**: MEDIUM | **Category**: performance

Expensive computations in render methods slow down rendering.

**What it catches:**
- Computations in render
- No memoization
- Unnecessary re-renders

**How to fix:**
- Add useMemo
- Add useCallback
- Memoize expensive calculations

**Recommendation**: Move expensive computations out of render
**Library**: React, Vue

**Applies to**: react, vue


**Source**: `src/rules/data/performance.json`

---

### PERF_IMAGES: Unoptimized images

**Severity**: MEDIUM | **Category**: performance

Images should be optimized and lazy loaded.

**What it catches:**
- Large image files
- No lazy loading
- Missing image optimization

**How to fix:**
- Use next/image
- Add lazy loading
- Compress images

**Recommendation**: Optimize images
**Library**: next/image, vite-imagetools

**Applies to**: All frameworks


**Source**: `src/rules/data/performance.json`

---

### PERF_IMMUTABLE: Mutable object mutation

**Severity**: LOW | **Category**: performance

Mutating objects creates side effects. Use immutable patterns.

**What it catches:**
- Array.push() mutations
- Object mutations
- Side effects

**How to fix:**
- Use spread operator
- Use Immer for immutable updates
- Prefer const over let

**Recommendation**: Prefer immutability
**Library**: Immer, immutable.js

**Applies to**: All frameworks


**Source**: `src/rules/data/performance.json`

---

### PERF_LIST_VIRTUALIZATION: Long list without virtualization

**Severity**: MEDIUM | **Category**: performance

Long lists should use virtualization for performance.

**What it catches:**
- Rendering thousands of items
- No list virtualization
- Slow scrolling

**How to fix:**
- Use react-window
- Virtualize large lists
- Only render visible items

**Recommendation**: Virtualize long lists
**Library**: react-window, vue-virtual-scroller

**Applies to**: react, vue, svelte, angular
**File Extensions**: .tsx, .jsx, .vue, .svelte

**Source**: `src/rules/data/performance.json`

---

### PERF_MEMORY_LEAK: Potential memory leak

**Severity**: HIGH | **Category**: performance

Global variables and uncached arrays can cause memory leaks.

**What it catches:**
- Global variable usage
- Unbounded arrays
- Missing cleanup

**How to fix:**
- Avoid global variables
- Clean up event listeners
- Clear intervals/timeouts

**Recommendation**: Check for potential memory leaks
**Library**: Node.js

**Applies to**: All frameworks


**Source**: `src/rules/data/performance.json`

---

### PERF_NO_CACHE_HEADERS: No caching headers

**Severity**: LOW | **Category**: performance

Static assets should have cache headers for better performance.

**What it catches:**
- No cache headers
- No ETag
- Repeated downloads

**How to fix:**
- Add Cache-Control header
- Use ETag
- Configure static asset caching

**Recommendation**: Add caching headers
**Library**: Caching

**Applies to**: All frameworks


**Source**: `src/rules/data/performance.json`

---

### PERF_NO_PAGINATION_LIST: No pagination on list endpoints

**Severity**: HIGH | **Category**: performance

List endpoints without pagination can return too much data.

**What it catches:**
- No pagination on APIs
- Returning all records
- Memory issues

**How to fix:**
- Add page/limit parameters
- Implement cursor-based pagination
- Limit result sets

**Recommendation**: Add pagination to list endpoints
**Library**: API

**Applies to**: All frameworks
**File Extensions**: .ts, .js

**Source**: `src/rules/data/performance.json`

---

### PERF_PRELOAD: Missing resource preload

**Severity**: LOW | **Category**: performance

Critical resources should be preloaded.

**What it catches:**
- No resource preloading
- Delayed critical resources
- Suboptimal loading

**How to fix:**
- Add preload links
- Prefetch critical assets
- Use link rel=preload

**Recommendation**: Preload critical resources
**Library**: HTML preload

**Applies to**: All frameworks


**Source**: `src/rules/data/performance.json`

---

### PERF_REGEX: Inefficient regex in loop

**Severity**: MEDIUM | **Category**: performance

Inefficient regex can slow down execution. Compile regexes outside loops.

**What it catches:**
- Regex created inside loops
- Inefficient pattern matching
- Performance degradation

**How to fix:**
- Move regex outside loops
- Compile regex once
- Use regex literals

**Recommendation**: Optimize regex patterns
**Library**: Performance

**Applies to**: All frameworks


**Source**: `src/rules/data/performance.json`

---

### PERF_REGEX_LOOP: Regex created inside loop

**Severity**: HIGH | **Category**: performance

Creating new RegExp inside loops causes repeated compilation. Move outside and reuse.

**What it catches:**
- Regex created in loop
- Repeated compilation
- Performance issues

**How to fix:**
- Move regex outside loop
- Compile once
- Reuse regex

**Recommendation**: Move regex outside loop
**Library**: Performance

**Applies to**: All frameworks
**File Extensions**: .ts, .tsx, .js, .jsx

**Source**: `src/rules/data/typescript.json`

---

### PERF_SERVER_IMPORTS: Server-only imports in client code

**Severity**: HIGH | **Category**: performance

Server-only modules should not be imported in client code.

**What it catches:**
- Server code in client bundle
- Prisma in client
- Increased bundle size

**How to fix:**
- Use 'server only' directive
- Keep server code in /app or /pages/api
- Use dynamic imports for server modules

**Recommendation**: Remove server-only imports from client
**Library**: Next.js

**Applies to**: nextjs
**File Extensions**: .ts, .tsx, .js, .jsx

**Source**: `src/rules/data/performance.json`

---

### PERF_SYNCHRONOUS: Synchronous file operations

**Severity**: MEDIUM | **Category**: performance

Use async/await for I/O operations to avoid blocking.

**What it catches:**
- readFileSync usage
- writeFileSync usage
- Blocking the event loop

**How to fix:**
- Use async/await versions
- Use fs.promises
- Never block in Node.js

**Recommendation**: Avoid synchronous operations
**Library**: Node.js

**Applies to**: nodejs, express, fastify


**Source**: `src/rules/data/performance.json`

---

### PERF_THIRD_PARTY_SCRIPT: Third-party tracking scripts

**Severity**: LOW | **Category**: performance

Third-party scripts impact load time. Audit and defer non-essential ones.

**What it catches:**
- Analytics scripts
- Tracking pixels
- Third-party embeds

**How to fix:**
- Defer third-party scripts
- Load asynchronously
- Audit necessity

**Recommendation**: Audit third-party scripts
**Library**: Performance

**Applies to**: All frameworks


**Source**: `src/rules/data/performance.json`

---

### PERF_TREE_SHAKING: Potential tree shaking issues

**Severity**: MEDIUM | **Category**: performance

Ensure ES modules and sideEffects: false for better tree shaking.

**What it catches:**
- No sideEffects config
- ES modules not used
- Unused code included

**How to fix:**
- Add sideEffects: false
- Use ES modules
- Configure webpack/rollup

**Recommendation**: Enable tree shaking
**Library**: Webpack, Rollup

**Applies to**: All frameworks
**File Extensions**: .json

**Source**: `src/rules/data/performance.json`

---

### PERF_UNUSED_DEP: Unused dependencies detected

**Severity**: MEDIUM | **Category**: performance

Unused dependencies bloat the project. Use depcheck tool.

**What it catches:**
- Unused packages in package.json
- Bloated installs
- Security risks

**How to fix:**
- Run depcheck
- Remove unused packages
- Use knip to find unused

**Recommendation**: Remove unused dependencies
**Library**: depcheck

**Applies to**: All frameworks


**Source**: `src/rules/data/performance.json`

---

### PERF_WEB_WORKER: Heavy computation on main thread

**Severity**: MEDIUM | **Category**: performance

Heavy computations should be moved to web workers.

**What it catches:**
- Heavy computation blocking UI
- No web workers
- Janky animations

**How to fix:**
- Move to web worker
- Use_comlink or similar
- Offload heavy tasks

**Recommendation**: Offload to web worker
**Library**: Web Workers

**Applies to**: All frameworks


**Source**: `src/rules/data/performance.json`

---

### REACT_BIND_IN_RENDER: .bind() in render method

**Severity**: MEDIUM | **Category**: performance

Binding functions in render creates new functions on each render. Use useCallback.

**What it catches:**
- Creating new function on every render
- Unnecessary re-renders of child components
- Memory overhead

**How to fix:**
- Use useCallback hook
- Bind in constructor (class components)
- Use arrow functions in class properties

**Recommendation**: Don't bind in render
**Library**: React

**Applies to**: react, nextjs


**Source**: `src/rules/data/react.json`

---

### REACT_UNNECESSARY_RERENDER: Expensive computation in render

**Severity**: LOW | **Category**: performance

Non-reactive values computed in render cause unnecessary re-renders.

**What it catches:**
- Expensive computation in render body
- Non-reactive values recalculated every render
- Performance issues

**How to fix:**
- Wrap computation in useMemo
- Use useCallback for functions
- Move expensive logic outside component

**Recommendation**: Use useMemo for expensive computations
**Library**: React

**Applies to**: react, nextjs


**Source**: `src/rules/data/react.json`

---

### SAAS_N_PLUS_1: Potential N+1 query problem

**Severity**: HIGH | **Category**: performance

N+1 queries occur when fetching records then looping to get related data. Use JOINs or eager loading.

**What it catches:**
- Loop fetching related data for each item
- Multiple database calls in forEach/map
- Missing eager loading

**How to fix:**
- Use ORM's include/with for eager loading
- Use JOINs instead of loops
- Batch fetch related records

**Recommendation**: Use eager loading
**Library**: ORM, Database

**Applies to**: All frameworks


**Source**: `src/rules/data/saas.json`

---

### SAAS_NO_CACHE: No caching detected

**Severity**: MEDIUM | **Category**: performance

Frequently accessed data should be cached to reduce database load.

**What it catches:**
- Repeated queries for same data
- No caching layer configured
- Database hit on every request

**How to fix:**
- Add Redis caching
- Cache frequently accessed data
- Set appropriate TTL

**Recommendation**: Add caching layer
**Library**: Redis, memory-cache

**Applies to**: All frameworks


**Source**: `src/rules/data/saas.json`

---

### SAAS_NO_CONNECTION_POOL: No database connection pooling

**Severity**: HIGH | **Category**: performance

Without connection pooling, each request creates a new connection causing latency.

**What it catches:**
- New connection per request
- Connection overhead
- Database latency

**How to fix:**
- Use connection pool
- Configure pool size
- Reuse connections

**Recommendation**: Use connection pooling
**Library**: Database, Pg, MySQL

**Applies to**: All frameworks


**Source**: `src/rules/data/saas.json`

---

### SAAS_NO_PAGINATION: Missing pagination on list endpoints

**Severity**: HIGH | **Category**: performance

Without pagination, list endpoints can return unbounded results causing memory issues and slow responses.

**What it catches:**
- API endpoints returning all records without limits
- No page/limit parameters on list routes
- Unbounded result sets

**How to fix:**
- Add page and limit query parameters
- Implement offset/limit or cursor-based pagination
- Set reasonable default limits

**Recommendation**: Add pagination to list endpoints
**Library**: API Design

**Applies to**: express, fastify, nextjs


**Source**: `src/rules/data/saas.json`

---

### SAAS_SYNC_BLOCKING: Synchronous blocking operations

**Severity**: HIGH | **Category**: performance

Synchronous operations block the event loop. Use async/await for I/O operations.

**What it catches:**
- readFileSync, writeFileSync usage
- Blocking the event loop
- Synchronous fs operations

**How to fix:**
- Use async/await versions
- Use fs.promises
- Move to worker threads if needed

**Recommendation**: Use async operations
**Library**: Node.js

**Applies to**: nodejs


**Source**: `src/rules/data/saas.json`

---

### SVELTE_TRANSITION_MISSING: Missing transition on conditionally rendered

**Severity**: LOW | **Category**: performance

Use transitions for better UX with conditionally rendered elements.

**What it catches:**
- Abrupt UI changes
- Poor user experience
- Jarring transitions

**How to fix:**
- Add transition:fn to elements
- Use in:transition for entering
- Use out:transition for leaving

**Recommendation**: Add transitions to conditionally rendered elements
**Library**: Svelte

**Applies to**: svelte


**Source**: `src/rules/data/svelte.json`

---

### TS_DECORATOR_PERFORMANCE: Class decorator impact

**Severity**: LOW | **Category**: performance

Decorators can impact performance. Use them carefully.

**What it catches:**
- Decorators used
- Performance overhead
- Reflection usage

**How to fix:**
- Use decorators carefully
- Benchmark impact
- Consider alternatives

**Recommendation**: Consider decorator impact
**Library**: TypeScript

**Applies to**: All frameworks
**File Extensions**: .ts

**Source**: `src/rules/data/typescript.json`

---

### VUE_ASYNC_COMPONENT: Async component without loading

**Severity**: LOW | **Category**: performance

Async components should have a loading component.

**What it catches:**
- Blank space while loading
- Poor user experience
- Layout shift

**How to fix:**
- Add loading component with defineAsyncComponent
- Use Suspense with async components
- Add delay option

**Recommendation**: Add loading component for async components
**Library**: Vue

**Applies to**: vue, nuxt


**Source**: `src/rules/data/vue.json`

---

### VUE_SCOPE_CSS: Deep selectors in scoped CSS

**Severity**: LOW | **Category**: performance

Deep selectors in scoped CSS can cause maintenance issues.

**What it catches:**
- Styles leaking to other components
- Hard to maintain styles
- Scoped CSS bypassed

**How to fix:**
- Use scoped CSS without deep selectors
- Pass classes to child components
- Refactor component structure

**Recommendation**: Avoid deep selectors in scoped CSS
**Library**: Vue

**Applies to**: vue, nuxt


**Source**: `src/rules/data/vue.json`

---

## Queues

### QUEUE_NO_DEDUP: Job missing deduplication

**Severity**: LOW | **Category**: queues

Prevent duplicate jobs using idempotency keys.

**What it catches:**
- Duplicate jobs processed
- Wasted resources
- Inconsistent state

**How to fix:**
- Add idempotency keys
- Configure removeOnComplete
- Use deduplication options

**Recommendation**: Add job deduplication
**Library**: Bull, Redis

**Applies to**: All frameworks
**File Extensions**: .ts, .js

**Source**: `src/rules/data/queues.json`

---

### QUEUE_NO_PRIORITY: Job queue missing priority

**Severity**: LOW | **Category**: queues

Prioritize critical jobs over background tasks.

**What it catches:**
- All jobs treated equally
- Critical jobs delayed
- Poor user experience

**How to fix:**
- Add priority to jobs
- Create separate queues
- Process by priority

**Recommendation**: Use priority queues
**Library**: Bull

**Applies to**: All frameworks
**File Extensions**: .ts, .js

**Source**: `src/rules/data/queues.json`

---

### QUEUE_NO_RETRIES: Job missing retry configuration

**Severity**: MEDIUM | **Category**: queues

Queue jobs should have explicit retry/attempts configuration. Note: This rule checks if queue-related files have retry config. Files without queue patterns are ignored.

**What it catches:**
- Queue jobs without retry configuration
- Failed jobs not retried
- No recovery from errors

**How to fix:**
- Configure retry attempts
- Set backoff strategy
- Handle transient failures

**Recommendation**: Configure job retries
**Library**: Bull, Agenda

**Applies to**: All frameworks
**File Extensions**: .ts, .js

**Source**: `src/rules/data/queues.json`

---

### QUEUE_NO_TIMEOUT: Job missing timeout

**Severity**: MEDIUM | **Category**: queues

Jobs should have timeouts to prevent hanging processes.

**What it catches:**
- Jobs running forever
- Process hangs
- No failure detection

**How to fix:**
- Add timeout to job options
- Set reasonable timeout values
- Handle timeout errors

**Recommendation**: Set job timeouts
**Library**: Bull, Agenda, Redis

**Applies to**: All frameworks
**File Extensions**: .ts, .js

**Source**: `src/rules/data/queues.json`

---

### QUEUE_SYNCHRONOUS: Synchronous job in request handler

**Severity**: HIGH | **Category**: queues

Long-running tasks should be queued, not processed synchronously.

**What it catches:**
- Slow HTTP responses
- Request timeouts
- Poor user experience

**How to fix:**
- Add job to queue, don't await
- Return immediately to user
- Process in background

**Recommendation**: Offload to background queue
**Library**: Bull, Agenda

**Applies to**: express, fastify, nextjs, nuxt
**File Extensions**: .ts, .js

**Source**: `src/rules/data/queues.json`

---

## React

### REACT_EFFECT_MISSING_DEPS: useEffect may have missing dependencies

**Severity**: MEDIUM | **Category**: react

Missing dependencies in useEffect can cause stale closure bugs.

**What it catches:**
- useEffect with missing dependency array
- Stale closure bugs
- Missing dependencies in deps array

**How to fix:**
- Add all used variables to deps array
- Use useCallback for functions in deps
- Consider splitting into multiple effects

**Recommendation**: Add exhaustive deps to useEffect
**Library**: React

**Applies to**: react, nextjs


**Source**: `src/rules/data/react.json`

---

## Reliability

### MOBILE_OFFLINE_FIRST: No offline support for critical features

**Severity**: MEDIUM | **Category**: reliability

Critical features should work offline using service workers.

**What it catches:**
- App unusable without internet
- Poor user experience offline
- Failed requests when offline

**How to fix:**
- Add service worker for caching
- Use Workbox for offline support
- Implement offline-first architecture

**Recommendation**: Add offline support
**Library**: Service Workers, Workbox

**Applies to**: pwa


**Source**: `src/rules/data/mobile.json`

---

### SAAS_NO_GRACEFUL_SHUTDOWN: No graceful shutdown handling

**Severity**: MEDIUM | **Category**: reliability

Handle SIGTERM/SIGINT to close connections and finish processing requests before exiting.

**What it catches:**
- No SIGTERM handler
- Connections dropped on shutdown
- In-flight requests lost

**How to fix:**
- Handle SIGTERM/SIGINT
- Close database connections
- Finish in-flight requests

**Recommendation**: Implement graceful shutdown
**Library**: Node.js

**Applies to**: nodejs


**Source**: `src/rules/data/saas.json`

---

### SAAS_NO_HEALTH_CHECK: No health check endpoint

**Severity**: MEDIUM | **Category**: reliability

Health checks (/health, /ready) are needed for load balancers and orchestration.

**What it catches:**
- No /health endpoint
- Load balancer can't check status
- Missing liveness probe

**How to fix:**
- Add /health and /ready endpoints
- Check dependencies in health check
- Configure Kubernetes probes

**Recommendation**: Add health check endpoint
**Library**: Kubernetes, Load Balancers

**Applies to**: express, fastify


**Source**: `src/rules/data/saas.json`

---

### SAAS_NO_IDEMPOTENCY: No idempotency for mutations

**Severity**: MEDIUM | **Category**: reliability

POST/PATCH/DELETE endpoints should support idempotency to handle retry safely.

**What it catches:**
- No idempotency keys
- Retries cause duplicate actions
- Payments could be duplicated

**How to fix:**
- Add idempotency key to POST
- Check key before processing
- Store key with result

**Recommendation**: Add idempotency keys
**Library**: API Design

**Applies to**: All frameworks


**Source**: `src/rules/data/saas.json`

---

### SAAS_NO_REQUEST_ID: No request ID tracking

**Severity**: LOW | **Category**: reliability

Add X-Request-ID headers for request tracing across services.

**What it catches:**
- No request tracing
- Hard to debug across services
- Missing correlation IDs

**How to fix:**
- Add X-Request-ID header
- Pass request ID to logs
- Use OpenTelemetry

**Recommendation**: Add request ID tracking
**Library**: Logging, Tracing

**Applies to**: All frameworks


**Source**: `src/rules/data/saas.json`

---

### TRPC_NO_ERROR_HANDLING: No error handling in caller

**Severity**: MEDIUM | **Category**: reliability

When calling procedures, handle errors properly.

**What it catches:**
- Uncaught errors crash app
- Poor error messages to users
- No error recovery

**How to fix:**
- Wrap calls in try-catch
- Use onError callback
- Show user-friendly error messages

**Recommendation**: Add error handling in caller
**Library**: tRPC

**Applies to**: nextjs, react


**Source**: `src/rules/data/trpc.json`

---

## Security

### AI_AUTH_WITHOUT_AUTHZ: Authentication without authorization check

**Severity**: MEDIUM | **Category**: security

Authentication is present but authorization checks are missing. Ensure users have permission for actions.

**What it catches:**
- Authentication without authorization
- Users can access unauthorized resources
- Potential data breaches

**How to fix:**
- Add permission checks
- Verify ownership
- Use authorization library

**Recommendation**: Add authorization checks
**Library**: CASL, authorization library

**Applies to**: All frameworks


**Source**: `src/rules/data/ai-patterns.json`

---

### AI_EXPOSED_SECRETS: NEXT_PUBLIC_ on secret variables

**Severity**: CRITICAL | **Category**: security

Variables with NEXT_PUBLIC_ prefix are exposed to the browser. Use them only for public config.

**What it catches:**
- NEXT_PUBLIC_ prefix on secret environment variables
- Private keys, API secrets, or tokens exposed to client-side code

**How to fix:**
- Remove NEXT_PUBLIC_ prefix from any secret variables
- Use server-side only environment variables for sensitive data

**Recommendation**: Remove NEXT_PUBLIC_ prefix from secret variables
**Library**: Next.js Environment Variables

**Applies to**: nextjs


**Source**: `src/rules/data/security.json`

---

### API_SENSITIVE_HEADER: Sensitive data in request headers

**Severity**: HIGH | **Category**: security

Avoid sending sensitive data like passwords or tokens in HTTP headers.

**What it catches:**
- Sensitive data in headers
- Potential data exposure
- Security vulnerability

**How to fix:**
- Use request body for sensitive data
- Use Authorization header for tokens
- Don't log sensitive headers

**Recommendation**: Don't expose sensitive data in headers
**Library**: API security

**Applies to**: All frameworks


**Source**: `src/rules/data/api.json`

---

### COMM_CREDENTIALS_COOKIE: Cookie without secure flag

**Severity**: HIGH | **Category**: security

Cookies with credentials should have Secure and HttpOnly flags set.

**What it catches:**
- Cookies set without Secure flag (can be sent over HTTP)
- Cookies without HttpOnly flag (accessible via JavaScript)
- Session cookies missing security attributes

**How to fix:**
- Add Secure flag to cookies
- Add HttpOnly flag to prevent XSS access
- Add SameSite attribute for CSRF protection

**Recommendation**: Add secure flag to cookies
**Library**: Cookie options

**Applies to**: All frameworks


**Source**: `src/rules/data/security.json`

---

### COMM_LOG_SENSITIVE: Logging sensitive data

**Severity**: HIGH | **Category**: security

Logging sensitive data (passwords, tokens, PII). Use redaction or exclude from logs.

**What it catches:**
- Logging passwords, tokens, API keys, or other secrets
- Logging PII like emails, phone numbers, or addresses
- Logging full request bodies that may contain sensitive data

**How to fix:**
- Redact sensitive fields before logging
- Use structured logging that excludes sensitive fields
- Never log req.body, headers, or authentication tokens

**Recommendation**: Remove sensitive data from logs
**Library**: pino, winston

**Applies to**: All frameworks


**Source**: `src/rules/data/security.json`

---

### COMM_SECRET_HARDCODED: Hardcoded API keys/secrets

**Severity**: CRITICAL | **Category**: security

API keys and secrets should be stored in environment variables, not in source code.

**What it catches:**
- Hardcoded API keys, secrets, tokens, or passwords in source files
- AWS keys, Stripe keys, database credentials embedded in code
- Private keys stored directly in variables

**How to fix:**
- Move all secrets to environment variables using process.env
- Use a secrets manager like AWS Secrets Manager or HashiCorp Vault
- Never commit .env files to version control

**Recommendation**: Remove hardcoded secrets
**Library**: dotenv

**Applies to**: All frameworks


**Source**: `src/rules/data/security.json`

---

### COMM_SELF_SIGNED_CERT: Self-signed certificate usage

**Severity**: MEDIUM | **Category**: security

Self-signed certificates should not be used in production. Use valid SSL certificates.

**What it catches:**
- Disabled SSL certificate verification
- Self-signed certificates in production
- Environment configured to trust invalid certificates

**How to fix:**
- Use valid SSL certificates from trusted CA
- Use Let's Encrypt for free certificates
- Never disable certificate verification in production

**Recommendation**: Use valid SSL certificates
**Library**: Let's Encrypt

**Applies to**: All frameworks


**Source**: `src/rules/data/security.json`

---

### COMM_URL_USER_CREDS: Credentials in URL parameters

**Severity**: HIGH | **Category**: security

Credentials in URL params are visible in browser history and logs. Use headers or body instead.

**What it catches:**
- API keys or passwords passed in URL query parameters
- Credentials visible in browser history and server logs
- Tokens or secrets in URL paths

**How to fix:**
- Move credentials to HTTP headers or request body
- Use Authorization header with Bearer tokens
- Never pass secrets in URLs

**Recommendation**: Remove credentials from URL
**Library**: HTTP Headers

**Applies to**: All frameworks


**Source**: `src/rules/data/security.json`

---

### DB_INJECTION_STRING: SQL injection via string concatenation

**Severity**: CRITICAL | **Category**: security

String concatenation in SQL queries creates SQL injection vulnerabilities. Use parameterized queries.

**What it catches:**
- SQL string concatenation
- SQL injection vulnerability
- Data breach risk

**How to fix:**
- Use parameterized queries
- Use ORM methods
- Never concatenate user input

**Recommendation**: Use parameterized queries
**Library**: Prepared statements, ORM

**Applies to**: All frameworks
**File Extensions**: .ts, .js

**Source**: `src/rules/data/database.json`

---

### EXPRESS_HELMET_MISSING: Missing security headers

**Severity**: MEDIUM | **Category**: security

Add Helmet middleware for security headers.

**What it catches:**
- No security headers
- Missing Helmet middleware
- Security vulnerabilities

**How to fix:**
- Add Helmet middleware
- Configure security headers
- Enable HSTS

**Recommendation**: Add security headers with Helmet
**Library**: helmet

**Applies to**: express


**Source**: `src/rules/data/express.json`

---

### FASTIFY_RATE_LIMIT_MISSING: No rate limiting

**Severity**: HIGH | **Category**: security

Add rate limiting to protect against abuse.

**What it catches:**
- No rate limiting
- Vulnerable to abuse
- DDoS risk

**How to fix:**
- Add @fastify/rate-limit
- Configure limits per route
- Use Redis for distributed

**Recommendation**: Add rate limiting
**Library**: @fastify/rate-limit

**Applies to**: fastify


**Source**: `src/rules/data/fastify.json`

---

### FASTIFY_SCHEMA_MISSING: No JSON schema for route

**Severity**: MEDIUM | **Category**: security

Fastify routes should have JSON schema for validation and serialization.

**What it catches:**
- No JSON schema for route
- No input validation
- No serialization optimization

**How to fix:**
- Add JSON schema to routes
- Validate input/output
- Use fast-json-stringify

**Recommendation**: Add JSON schema to route
**Library**: Fastify

**Applies to**: fastify


**Source**: `src/rules/data/fastify.json`

---

### LOG_SENSITIVE: Logging sensitive data

**Severity**: HIGH | **Category**: security

Passwords, tokens, and PII should never be logged.

**What it catches:**
- Passwords being logged
- API tokens exposed in logs
- PII being recorded
- Security vulnerabilities

**How to fix:**
- Redact sensitive fields before logging
- Use structured logging with field allowlists
- Implement log masking middleware
- Audit logging statements

**Recommendation**: Don't log sensitive data
**Library**: Security

**Applies to**: All frameworks


**Source**: `src/rules/data/logging.json`

---

### NUXT_CONFIG_PUBLIC: Secrets in public config

**Severity**: CRITICAL | **Category**: security

Runtime config public keys are exposed to the client. Use private keys for secrets.

**What it catches:**
- API keys exposed to client
- Secrets leaked in browser
- Security vulnerabilities

**How to fix:**
- Move secrets to runtimeConfig.private
- Access private config server-side only
- Never put secrets in public section

**Recommendation**: Move secrets out of public config
**Library**: Nuxt

**Applies to**: nuxt


**Source**: `src/rules/data/nuxt.json`

---

### OWASP_A01_BROKEN_ACCESS: IDOR - missing ownership verification

**Severity**: CRITICAL | **Category**: security

IDOR risk: Verify user ownership before accessing or modifying resources.

**What it catches:**
- Database queries without ownership checks
- API endpoints that return data based on ID without verifying ownership
- User able to access other users' data by changing IDs

**How to fix:**
- Add ownership verification before data access
- Check that req.user.id matches the requested resource owner
- Use database-level row security policies

**Recommendation**: Add ownership verification
**Library**: Authorization

**Applies to**: All frameworks


**Source**: `src/rules/data/security.json`

---

### OWASP_A02_CRYPTO_FAIL: Hardcoded encryption keys

**Severity**: CRITICAL | **Category**: security

Encryption keys must be loaded from environment variables, never hardcoded.

**What it catches:**
- Encryption keys hardcoded in source files
- Secret keys stored in variables
- Keys embedded in configuration

**How to fix:**
- Load encryption keys from environment variables
- Use key management services like AWS KMS
- Never commit keys to version control

**Recommendation**: Remove hardcoded encryption keys
**Library**: dotenv

**Applies to**: All frameworks


**Source**: `src/rules/data/security.json`

---

### OWASP_A03_INJECTION: SQL injection via string concatenation

**Severity**: CRITICAL | **Category**: security

SQL injection risk. Use parameterized queries or an ORM.

**What it catches:**
- SQL queries built with string concatenation
- Template literals with variables in SQL
- User input directly in query strings

**How to fix:**
- Use parameterized queries with placeholders
- Use an ORM like Prisma or Drizzle
- Never concatenate user input into SQL strings

**Recommendation**: Use parameterized queries
**Library**: Prisma, Drizzle, Knex

**Applies to**: All frameworks


**Source**: `src/rules/data/security.json`

---

### OWASP_A03_INJECTION_CMD: Command injection via exec/eval

**Severity**: CRITICAL | **Category**: security

Command injection risk. Avoid shell execution with unsanitized input.

**What it catches:**
- Using exec() or execSync() with string concatenation
- eval() with user input
- Dynamic code execution with user-controlled strings

**How to fix:**
- Avoid exec/eval with user input entirely
- Use child_process with array arguments instead of shell strings
- Use JSON.parse instead of eval for data

**Recommendation**: Avoid exec/eval with user input
**Library**: child_process (with proper escaping)

**Applies to**: All frameworks


**Source**: `src/rules/data/security.json`

---

### OWASP_A04_INSECURE_DESIGN: Missing input validation

**Severity**: HIGH | **Category**: security

Validate user inputs using Zod, Yup, or similar libraries.

**What it catches:**
- User input used directly without validation
- API endpoints without input validation
- Potential injection attacks

**How to fix:**
- Add Zod or Yup validation schemas
- Validate function parameters
- Use type-safe validation

**Recommendation**: Add input validation
**Library**: Zod, Yup

**Applies to**: All frameworks


**Source**: `src/rules/data/security.json`

---

### OWASP_A05_MISCONFIG: Debug mode enabled in production

**Severity**: HIGH | **Category**: security

Debug mode should be disabled in production.

**What it catches:**
- Debug mode enabled in production configuration
- NODE_ENV=development in production
- Verbose error reporting exposed to users

**How to fix:**
- Set NODE_ENV=production
- Disable debug mode in production configs
- Use environment-specific configuration

**Recommendation**: Disable debug mode in production
**Library**: Configuration

**Applies to**: All frameworks


**Source**: `src/rules/data/security.json`

---

### OWASP_A06_VULN_COMPONENT: Using vulnerable/outdated components

**Severity**: CRITICAL | **Category**: security

Using outdated dependencies with known vulnerabilities. Run npm audit and update regularly.

**What it catches:**
- Outdated npm packages without vulnerability scanning
- No automated dependency updates
- Missing security audit in CI/CD

**How to fix:**
- Run npm audit in CI/CD pipeline
- Set up Dependabot for automated PRs
- Regularly update dependencies

**Recommendation**: Update dependencies regularly
**Library**: npm audit

**Applies to**: All frameworks


**Source**: `src/rules/data/security.json`

---

### OWASP_A07_AUTH_FAIL: Weak authentication policy

**Severity**: MEDIUM | **Category**: security

Add password strength validation and requirements.

**What it catches:**
- Passwords without strength validation
- Missing password complexity requirements
- No protection against weak passwords

**How to fix:**
- Add password strength validation with zxcvbn
- Enforce minimum password length and complexity
- Check passwords against common password lists

**Recommendation**: Strengthen password policy
**Library**: zxcvbn

**Applies to**: All frameworks


**Source**: `src/rules/data/security.json`

---

### OWASP_A08_INTEGRITY_FAIL: Unvalidated file uploads

**Severity**: HIGH | **Category**: security

File uploads must be validated. Check file type, size, and content.

**What it catches:**
- File uploads without type validation
- No file size limits
- Uploaded files saved without validation

**How to fix:**
- Validate file type using magic numbers, not just extension
- Set maximum file size limits
- Store files outside web root with random names

**Recommendation**: Validate file uploads
**Library**: File validation

**Applies to**: All frameworks


**Source**: `src/rules/data/security.json`

---

### OWASP_A09_SECURITY_LOGGING: Insufficient security logging

**Severity**: MEDIUM | **Category**: security

Log security-relevant events including login failures, access control violations, and server errors.

**What it catches:**
- No logging of authentication attempts
- Missing audit trail for sensitive operations
- No logging of access control violations

**How to fix:**
- Log all login attempts (success and failure)
- Log access control violations
- Log admin actions and sensitive data access

**Recommendation**: Add security logging
**Library**: Logging

**Applies to**: All frameworks


**Source**: `src/rules/data/security.json`

---

### OWASP_A10_SSRF: Unvalidated URL redirects

**Severity**: HIGH | **Category**: security

SSRF risk: Validate and sanitize URLs before fetching.

**What it catches:**
- Fetching URLs from user input without validation
- Server making requests to internal infrastructure
- Unvalidated redirect URLs

**How to fix:**
- Validate URLs against allowlist
- Block internal IP ranges and private addresses
- Use URL parser to verify hostname before fetching

**Recommendation**: Validate URL before fetching
**Library**: URL validation

**Applies to**: All frameworks


**Source**: `src/rules/data/security.json`

---

### SAAS_NO_AUTH: Route without authentication

**Severity**: CRITICAL | **Category**: security

API endpoints should require authentication unless explicitly public.

**What it catches:**
- API endpoints without auth check
- Routes that should be protected
- Missing auth middleware

**How to fix:**
- Add authentication middleware
- Protect sensitive endpoints
- Use auth middleware on routes

**Recommendation**: Add authentication
**Library**: Auth, JWT, Sessions

**Applies to**: express, fastify


**Source**: `src/rules/data/saas.json`

---

### SAAS_NO_AUTHZ: Potential missing authorization checks

**Severity**: MEDIUM | **Category**: security

After authentication, verify user has permission to access the resource.

**What it catches:**
- User can access others' data
- No ownership verification
- Missing permission checks

**How to fix:**
- Add ownership checks
- Verify user owns resource
- Add role-based checks

**Recommendation**: Add authorization checks
**Library**: Authorization

**Applies to**: All frameworks


**Source**: `src/rules/data/saas.json`

---

### SAAS_NO_CORS_CONFIG: Missing or overly permissive CORS

**Severity**: HIGH | **Category**: security

CORS should whitelist specific origins, not use wildcard * in production.

**What it catches:**
- CORS not configured
- Using wildcard origin
- Too permissive

**How to fix:**
- Configure allowed origins
- Use environment-based config
- Never use * in production

**Recommendation**: Configure CORS properly
**Library**: CORS

**Applies to**: express, fastify


**Source**: `src/rules/data/saas.json`

---

### SAAS_NO_CSRF: Missing CSRF protection

**Severity**: HIGH | **Category**: security

State-changing requests need CSRF tokens for browser clients.

**What it catches:**
- No CSRF tokens
- Vulnerable to cross-site requests
- State-changing ops unprotected

**How to fix:**
- Use csurf or node-csurf middleware
- Add CSRF token to forms
- Use SameSite cookies

**Recommendation**: Add CSRF protection
**Library**: CSRF

**Applies to**: express


**Source**: `src/rules/data/saas.json`

---

### SAAS_NO_HTTPS: Missing HTTPS enforcement

**Severity**: MEDIUM | **Category**: security

Redirect HTTP to HTTPS and set HSTS header.

**What it catches:**
- No HTTPS redirect
- Traffic can be intercepted
- No HSTS header

**How to fix:**
- Redirect HTTP to HTTPS
- Add HSTS header
- Use Helmet

**Recommendation**: Enforce HTTPS
**Library**: TLS, Helmet

**Applies to**: All frameworks


**Source**: `src/rules/data/saas.json`

---

### SAAS_NO_INPUT_SANITIZATION: Missing input sanitization

**Severity**: MEDIUM | **Category**: security

All user input should be validated and sanitized before use.

**What it catches:**
- No input validation
- Raw user input used
- Vulnerable to injection

**How to fix:**
- Use Zod or Yup schemas
- Validate all inputs
- Sanitize before use

**Recommendation**: Sanitize all inputs
**Library**: Validation, Sanitization

**Applies to**: All frameworks


**Source**: `src/rules/data/saas.json`

---

### SAAS_NO_RATE_LIMIT: No rate limiting detected

**Severity**: HIGH | **Category**: security

APIs without rate limiting are vulnerable to abuse and DDoS attacks.

**What it catches:**
- No rate limiting on endpoints
- Vulnerable to brute force
- No protection against DDoS

**How to fix:**
- Add express-rate-limit
- Configure limits per endpoint
- Add stricter limits for auth endpoints

**Recommendation**: Add rate limiting
**Library**: express-rate-limit

**Applies to**: express, fastify


**Source**: `src/rules/data/saas.json`

---

### SAAS_NO_TENANT_ISOLATION: Potential missing tenant isolation

**Severity**: MEDIUM | **Category**: security

Multi-tenant apps must filter by tenant ID to prevent data leaks between tenants.

**What it catches:**
- No tenant ID filtering
- Users can see other tenants' data
- Missing RLS policies

**How to fix:**
- Add tenant_id to all queries
- Implement RLS policies
- Verify tenant context

**Recommendation**: Add tenant isolation
**Library**: Database, Row-Level Security

**Applies to**: All frameworks


**Source**: `src/rules/data/saas.json`

---

### SAAS_SESSION_FIXATION: Session fixation vulnerability

**Severity**: HIGH | **Category**: security

Session IDs should be regenerated after authentication to prevent fixation attacks.

**What it catches:**
- Session not regenerated on login
- Session fixation possible
- Same ID before and after auth

**How to fix:**
- Call req.session.regenerate() on login
- Create new session after auth
- Use secure session config

**Recommendation**: Regenerate session on login
**Library**: Sessions

**Applies to**: express


**Source**: `src/rules/data/saas.json`

---

### SEC_CLIENT_SIDE_CRYPTO: Client-side cryptographic signing

**Severity**: HIGH | **Category**: security

Cryptographic signing and token generation should happen server-side, not in frontend.

**What it catches:**
- HMAC in browser code
- Signing operations in frontend
- Keys exposed in JavaScript

**How to fix:**
- Move crypto to server
- Never expose keys in frontend
- Use server-side APIs for signing

**Recommendation**: Move crypto operations to server
**Library**: Backend API

**Applies to**: All frameworks


**Source**: `src/rules/data/security.json`

---

### SEC_CLIENT_VALIDATION_ONLY: Client-side validation only

**Severity**: HIGH | **Category**: security

Client-side validation can be bypassed. Always validate on the server as well.

**What it catches:**
- Only HTML5/form validation without server check
- Validation bypassable via API calls
- Missing backend validation

**How to fix:**
- Add server-side validation with Zod or Yup
- Never trust client-side validation alone
- Validate in API routes before processing

**Recommendation**: Add server-side validation
**Library**: Zod, Yup, Joi

**Applies to**: All frameworks


**Source**: `src/rules/data/security.json`

---

### SEC_CORS_WILDCARD: CORS wildcard origin

**Severity**: MEDIUM | **Category**: security

Using wildcard origin in CORS is insecure. Specify explicit origins.

**What it catches:**
- CORS origin set to '*' (allow all)
- Any website can access your API
- Credentials can be sent to any origin

**How to fix:**
- Specify explicit allowed origins
- Use environment-based origin whitelist
- Never use '*' in production

**Recommendation**: Restrict CORS origins
**Library**: CORS

**Applies to**: All frameworks


**Source**: `src/rules/data/security.json`

---

### SEC_DEFAULT_CREDENTIALS: Hardcoded default credentials

**Severity**: CRITICAL | **Category**: security

Seed scripts and migrations should not contain default admin accounts. Remove before production.

**What it catches:**
- Default admin accounts in seed data
- Hardcoded admin passwords
- Test accounts deployed to production

**How to fix:**
- Remove seed users before deployment
- Require password change on first login
- Never commit default credentials

**Recommendation**: Remove default credentials
**Library**: Database

**Applies to**: All frameworks


**Source**: `src/rules/data/security.json`

---

### SEC_DEPENDENCY_CONFUSION: Dependency confusion attack risk

**Severity**: HIGH | **Category**: security

Configure npm/pnpm to prefer private registries over public for internal packages.

**What it catches:**
- Internal packages on public registry
- npm configured to pull from wrong registry
- Malicious package with same name as internal

**How to fix:**
- Configure npm to use private registry
- Use scoped packages for internal code
- Verify registry configuration in .npmrc

**Recommendation**: Secure package resolution
**Library**: npm config

**Applies to**: All frameworks


**Source**: `src/rules/data/security.json`

---

### SEC_DESERIALIZATION: Insecure deserialization

**Severity**: CRITICAL | **Category**: security

Deserializing untrusted data is dangerous. Use JSON.parse() or safe libraries.

**What it catches:**
- Using pickle.loads (Python) with untrusted data
- Using ObjectInputStream with user data
- Unsafe deserialization formats

**How to fix:**
- Use JSON.parse for data
- Avoid pickle with untrusted input
- Use safe serialization formats

**Recommendation**: Use safe deserialization
**Library**: Security

**Applies to**: All frameworks


**Source**: `src/rules/data/security.json`

---

### SEC_DOS_REGEX: Regex DoS vulnerability

**Severity**: MEDIUM | **Category**: security

User input in regex can lead to ReDoS attacks. Validate and limit input.

**What it catches:**
- User input used in regex patterns
- Complex nested quantifiers in regex
- Regex vulnerable to catastrophic backtracking

**How to fix:**
- Use safe-regex to validate patterns
- Limit input length before regex
- Avoid nested quantifiers like (a+)+

**Recommendation**: Use safe regex patterns
**Library**: Security

**Applies to**: All frameworks


**Source**: `src/rules/data/security.json`

---

### SEC_DYNAMIC_IMPORT: Dynamic code execution risk

**Severity**: HIGH | **Category**: security

Dynamic import or require with user input can lead to RCE.

**What it catches:**
- require() with user input
- Dynamic import with user-controlled path
- Module loading from user input

**How to fix:**
- Never require/import with user input
- Whitelist allowed modules
- Use static imports only

**Recommendation**: Avoid dynamic imports with user input
**Library**: JavaScript

**Applies to**: All frameworks


**Source**: `src/rules/data/security.json`

---

### SEC_EVAL_USAGE: Dangerous eval usage

**Severity**: CRITICAL | **Category**: security

eval(), new Function(), and similar functions with user input lead to RCE vulnerabilities.

**What it catches:**
- eval() with user input
- new Function() with dynamic code
- Dynamic code execution

**How to fix:**
- Never use eval with user input
- Use JSON.parse for data
- Refactor to avoid dynamic code

**Recommendation**: Avoid eval with user input
**Library**: JavaScript

**Applies to**: All frameworks


**Source**: `src/rules/data/security.json`

---

### SEC_GIT_DIRECTORY_EXPOSED: Git directory exposure risk

**Severity**: HIGH | **Category**: security

Web servers should deny access to .git directories to prevent repository exposure.

**What it catches:**
- .git directory publicly accessible
- Source code exposed via web
- Commit history visible

**How to fix:**
- Block .git in web server config
- Use .gitignore to exclude from deployments
- Configure CDN to block .git paths

**Recommendation**: Block .git directory access
**Library**: Web server config

**Applies to**: All frameworks


**Source**: `src/rules/data/security.json`

---

### SEC_HARDENED_CSP: Missing Content Security Policy

**Severity**: MEDIUM | **Category**: security

CSP helps prevent XSS and data injection attacks.

**What it catches:**
- No Content-Security-Policy header set
- Browser can execute any script
- XSS attacks can load external scripts

**How to fix:**
- Add CSP header with strict policy
- Define allowed sources for scripts, styles, images
- Start with report-only mode to find issues

**Recommendation**: Add Content Security Policy
**Library**: Helmet

**Applies to**: All frameworks


**Source**: `src/rules/data/security.json`

---

### SEC_HOMEBREW_CRYPTO: Homebrewed cryptography

**Severity**: MEDIUM | **Category**: security

Use Node.js crypto or libraries like crypto-js. Never implement custom encryption.

**What it catches:**
- Custom XOR encryption
- MD5 or DES for hashing/encryption
- String manipulation as encryption

**How to fix:**
- Use Node.js crypto module
- Use AES-256 for encryption
- Use SHA-256 or better for hashing

**Recommendation**: Use standard cryptographic libraries
**Library**: Node.js crypto, crypto-js

**Applies to**: All frameworks


**Source**: `src/rules/data/security.json`

---

### SEC_INSECURE_RANDOM: Insecure random number generation

**Severity**: HIGH | **Category**: security

Math.random() is not cryptographically secure. Use crypto.randomBytes() or crypto.randomUUID().

**What it catches:**
- Using Math.random() for security-sensitive operations
- Session IDs or tokens generated with Math.random()
- Predictable random values used for security

**How to fix:**
- Use crypto.randomUUID() for IDs
- Use crypto.randomBytes() for tokens
- Never use Math.random() for security purposes

**Recommendation**: Use secure random generation
**Library**: Node.js crypto

**Applies to**: All frameworks
**File Extensions**: .ts, .js, .tsx, .jsx

**Source**: `src/rules/data/security.json`

---

### SEC_INSECURE_SESSION_STORAGE: Insecure session storage

**Severity**: HIGH | **Category**: security

JWTs and tokens should be stored in HttpOnly cookies, not localStorage or sessionStorage.

**What it catches:**
- JWT stored in localStorage
- Tokens accessible to JavaScript
- Session data vulnerable to XSS

**How to fix:**
- Store tokens in HttpOnly cookies
- Use secure cookie options
- Avoid localStorage for sensitive data

**Recommendation**: Use secure session storage
**Library**: Cookie options

**Applies to**: All frameworks


**Source**: `src/rules/data/security.json`

---

### SEC_INSECURE_TEMP_FILE: Insecure temporary file creation

**Severity**: MEDIUM | **Category**: security

Temporary files should be created with secure random names in secure directories.

**What it catches:**
- Predictable temp file paths
- Files in /tmp with static names
- Race conditions in temp files

**How to fix:**
- Use crypto.randomUUID() for filenames
- Use OS temp directory with secure permissions
- Create files with random names

**Recommendation**: Use secure temp file handling
**Library**: Node.js crypto

**Applies to**: All frameworks


**Source**: `src/rules/data/security.json`

---

### SEC_JWT_NONE: JWT with 'none' algorithm

**Severity**: CRITICAL | **Category**: security

JWT with 'none' algorithm is insecure. Use RS256 or HS256.

**What it catches:**
- JWT configured to allow 'none' algorithm
- Unsigned JWT tokens accepted
- Algorithm not explicitly set

**How to fix:**
- Explicitly set allowed algorithms (HS256, RS256)
- Never allow 'none' algorithm
- Verify algorithm matches expected type

**Recommendation**: Use proper JWT algorithms
**Library**: JWT

**Applies to**: All frameworks


**Source**: `src/rules/data/security.json`

---

### SEC_MISSING_HEADERS: Missing security headers

**Severity**: MEDIUM | **Category**: security

Add security headers including Content-Security-Policy, X-Frame-Options, X-Content-Type-Options.

**What it catches:**
- Missing Content-Security-Policy header
- Missing X-Frame-Options header
- Missing X-Content-Type-Options header

**How to fix:**
- Add Helmet.js middleware
- Configure CSP for your application
- Set X-Frame-Options to DENY or SAMEORIGIN

**Recommendation**: Add security headers
**Library**: Helmet

**Applies to**: All frameworks


**Source**: `src/rules/data/security.json`

---

### SEC_NOSQL_INJECTION: NoSQL injection vulnerability

**Severity**: CRITICAL | **Category**: security

NoSQL queries should not accept user input directly. Use query builders or sanitize operators.

**What it catches:**
- User input directly in MongoDB queries
- NoSQL operators from user input
- MongoDB query injection

**How to fix:**
- Use Mongoose with schema validation
- Sanitize user input for NoSQL
- Validate and type-check inputs

**Recommendation**: Use parameterized NoSQL queries
**Library**: MongoDB, Mongoose

**Applies to**: All frameworks


**Source**: `src/rules/data/security.json`

---

### SEC_NPM_OVERRIDE: Dependency override vulnerability

**Severity**: HIGH | **Category**: security

Dependency overrides can introduce malicious code. Audit all overrides.

**What it catches:**
- npm overrides in package.json
- Forcing specific dependency versions
- packageExtensions modifying packages

**How to fix:**
- Audit all dependency overrides
- Use direct dependencies instead of overrides
- Review overrides in security audits

**Recommendation**: Audit dependency overrides
**Library**: npm audit

**Applies to**: All frameworks


**Source**: `src/rules/data/security.json`

---

### SEC_OPEN_REDIRECT: Open redirect vulnerability

**Severity**: HIGH | **Category**: security

Redirect URLs must be validated against an allowlist. Never trust user-supplied URLs.

**What it catches:**
- Redirecting to URLs from user input
- Following redirect URLs without validation
- Open redirect in login/logout flows

**How to fix:**
- Validate redirect URLs against allowlist
- Verify URL is relative or from trusted domain
- Never redirect to arbitrary URLs

**Recommendation**: Validate redirect URLs
**Library**: URL validation

**Applies to**: All frameworks


**Source**: `src/rules/data/security.json`

---

### SEC_PATH_TRAVERSAL: Potential path traversal

**Severity**: MEDIUM | **Category**: security

User input used in file paths can lead to path traversal attacks. Validate and sanitize paths.

**What it catches:**
- User input in file paths
- Path traversal with ../ sequences
- Accessing files outside intended directory

**How to fix:**
- Validate path is within expected directory
- Use path.resolve and check startsWith
- Reject paths with .. sequences

**Recommendation**: Validate file paths
**Library**: Security

**Applies to**: All frameworks


**Source**: `src/rules/data/security.json`

---

### SEC_PLAINTEXT_PASSWORD: Plaintext password storage

**Severity**: CRITICAL | **Category**: security

Passwords must be hashed using bcrypt, argon2, or scrypt before storing in database.

**What it catches:**
- Passwords stored without hashing
- Base64 encoding used for passwords
- Passwords in database as plaintext

**How to fix:**
- Hash passwords with bcrypt or argon2
- Never store plaintext passwords
- Use proper password hashing libraries

**Recommendation**: Hash passwords before storage
**Library**: bcrypt, argon2, scrypt

**Applies to**: All frameworks


**Source**: `src/rules/data/security.json`

---

### SEC_PROTOTYPE_POLLUTION: Potential prototype pollution

**Severity**: CRITICAL | **Category**: security

User input merged into objects can pollute prototypes. Use safe merge libraries.

**What it catches:**
- User input merged into objects without sanitization
- Using Object.assign with user data
- Blindly copying user properties

**How to fix:**
- Use lodash cloneDeep for copying
- Create objects with Object.create(null)
- Use safe-merge libraries

**Recommendation**: Prevent prototype pollution
**Library**: lodash (cloneDeep), Object.freeze

**Applies to**: All frameworks


**Source**: `src/rules/data/security.json`

---

### SEC_RACE_CONDITION: Potential race condition in financial operations

**Severity**: HIGH | **Category**: security

Use transactions or locking for operations that modify balances or counts.

**What it catches:**
- Financial calculations without locking
- Balance updates without transactions
- Concurrent modifications to same record

**How to fix:**
- Use database transactions
- Use row-level locking
- Use optimistic locking with version field

**Recommendation**: Prevent race conditions in financial ops
**Library**: Database transactions

**Applies to**: All frameworks


**Source**: `src/rules/data/security.json`

---

### SEC_SENSITIVE_HEADERS: Sensitive headers in response

**Severity**: LOW | **Category**: security

Remove headers like X-Powered-By that reveal server information.

**What it catches:**
- X-Powered-By header exposing server info
- Server version information in headers
- Technology stack revealed in responses

**How to fix:**
- Remove X-Powered-By header
- Use Helmet to strip sensitive headers
- Configure server to hide version info

**Recommendation**: Remove sensitive headers from response
**Library**: Helmet

**Applies to**: All frameworks


**Source**: `src/rules/data/security.json`

---

### SEC_SQL_MISSING_PARAM: SQL query without parameterization

**Severity**: CRITICAL | **Category**: security

SQL queries should use parameterized inputs to prevent injection.

**What it catches:**
- Raw SQL with string concatenation
- Template literals in SQL queries
- Potential SQL injection

**How to fix:**
- Use parameterized queries
- Use an ORM
- Escape user input

**Recommendation**: Use parameterized queries
**Library**: Database

**Applies to**: All frameworks


**Source**: `src/rules/data/security.json`

---

### SEC_STRICT_TRANSPORT: Missing HSTS header

**Severity**: MEDIUM | **Category**: security

HTTP Strict Transport Security forces HTTPS connections.

**What it catches:**
- Missing HSTS header
- Site accessible over HTTP after HTTPS
- Man-in-the-middle attacks possible

**How to fix:**
- Enable HSTS with max-age
- Add preload flag for browser inclusion
- Use Helmet.js

**Recommendation**: Enable HSTS
**Library**: Helmet

**Applies to**: All frameworks


**Source**: `src/rules/data/security.json`

---

### SEC_TIMING_ATTACK: Potential timing attack

**Severity**: MEDIUM | **Category**: security

Variable-time comparisons can leak timing information. Use crypto.timingSafeEqual().

**What it catches:**
- Using == for comparing secrets
- Variable-time string comparisons
- Timing differences in authentication

**How to fix:**
- Use crypto.timingSafeEqual() for comparisons
- Use constant-time comparison functions
- Compare hashes instead of raw values

**Recommendation**: Use constant-time comparisons
**Library**: Node.js crypto

**Applies to**: All frameworks


**Source**: `src/rules/data/security.json`

---

### SEC_TIMING_ATTACK_DISCLOSURE: Timing-based information disclosure

**Severity**: MEDIUM | **Category**: security

Login and authentication should use constant-time comparisons to prevent username enumeration.

**What it catches:**
- Early return when user not found in login
- Different response times for valid vs invalid usernames
- Username enumeration via timing

**How to fix:**
- Always perform password comparison even if user not found
- Use constant-time comparison functions
- Return same response time regardless of user existence

**Recommendation**: Use constant-time comparisons
**Library**: Node.js crypto

**Applies to**: All frameworks


**Source**: `src/rules/data/security.json`

---

### SEC_TYPE_JUGGLING: Type juggling vulnerability

**Severity**: MEDIUM | **Category**: security

Use strict equality (===) instead of loose equality (==) in security checks.

**What it catches:**
- Using == instead of === in authentication
- Loose equality that can be bypassed
- Type coercion in security checks

**How to fix:**
- Always use === for comparisons
- Never use == in authentication code
- Use strict type checking throughout

**Recommendation**: Use strict equality
**Library**: JavaScript

**Applies to**: All frameworks


**Source**: `src/rules/data/security.json`

---

### SEC_TYPOSQUATTING: Potential typosquatting attack

**Severity**: MEDIUM | **Category**: security

Check for typosquatting attacks in dependencies. Use exact versions.

**What it catches:**
- Dependencies without exact versions
- Using ^ or ~ version ranges
- Package names that could be typosquatted

**How to fix:**
- Pin exact versions in package.json
- Use npm audit to check for issues
- Verify package names before installing

**Recommendation**: Verify package names
**Library**: npm

**Applies to**: All frameworks


**Source**: `src/rules/data/security.json`

---

### SEC_UNICODE_NORMALIZATION: Unicode normalization vulnerability

**Severity**: MEDIUM | **Category**: security

Account recovery should normalize Unicode characters to prevent homograph attacks.

**What it catches:**
- Unicode characters not normalized in usernames
- Homograph attacks possible
- Different Unicode chars that look the same

**How to fix:**
- Normalize Unicode with str.normalize('NFKC')
- Use case-insensitive comparisons carefully
- Validate username format strictly

**Recommendation**: Normalize Unicode strings
**Library**: Node.js

**Applies to**: All frameworks


**Source**: `src/rules/data/security.json`

---

### SEC_UNPROTECTED_ATTR_INJECTION: Unprotected attribute injection

**Severity**: HIGH | **Category**: security

Database update operations should whitelist allowed fields. Never spread user input directly.

**What it catches:**
- User input spread directly into database updates
- Users can set admin flags via API
- Privilege escalation via update endpoints

**How to fix:**
- Whitelist allowed fields in updates
- Never allow role/is_admin in user input
- Validate all update parameters explicitly

**Recommendation**: Whitelist allowed fields
**Library**: Validation

**Applies to**: All frameworks


**Source**: `src/rules/data/security.json`

---

### SEC_UNVERIFIED_JWT: Unverified JWT signature

**Severity**: CRITICAL | **Category**: security

JWT tokens must have their signatures verified. Never trust decoded payload without verification.

**What it catches:**
- Using jwt.decode without verify
- Trusting JWT payload without signature check
- decode() used instead of verify()

**How to fix:**
- Always use jwt.verify() not jwt.decode()
- Verify signature before trusting payload
- Explicitly set allowed algorithms

**Recommendation**: Verify JWT signatures
**Library**: jsonwebtoken, jose

**Applies to**: All frameworks


**Source**: `src/rules/data/security.json`

---

### SEC_VERBOSE_ERRORS: Verbose error information leakage

**Severity**: HIGH | **Category**: security

Error handlers should not expose raw error messages, stack traces, or internal details to clients.

**What it catches:**
- Raw error messages returned to clients
- Stack traces exposed in responses
- Database schema details in error messages

**How to fix:**
- Return generic error messages to users
- Log detailed errors server-side only
- Use error handling middleware

**Recommendation**: Sanitize error messages
**Library**: Error handling

**Applies to**: All frameworks


**Source**: `src/rules/data/security.json`

---

### SEC_WEAK_CIPHER: Weak cryptographic cipher

**Severity**: MEDIUM | **Category**: security

Use strong cryptographic ciphers. Avoid weak ones like DES or RC4.

**What it catches:**
- Weak TLS ciphers configured
- Using DES, RC4, or other deprecated ciphers
- Insecure cipher suites enabled

**How to fix:**
- Use TLS 1.2 or higher
- Configure strong cipher suites
- Disable weak ciphers like DES and RC4

**Recommendation**: Use strong ciphers
**Library**: TLS

**Applies to**: All frameworks


**Source**: `src/rules/data/security.json`

---

### SEC_WEAK_JWT_SECRET: Weak JWT secret constant

**Severity**: CRITICAL | **Category**: security

JWT secrets must be long, random strings loaded from environment variables.

**What it catches:**
- Predictable JWT secrets
- Short or default secrets
- Secrets in source code

**How to fix:**
- Use 256+ bit random secret from environment
- Generate secret with crypto.randomBytes(32)
- Never hardcode JWT secrets

**Recommendation**: Use strong JWT secrets
**Library**: dotenv

**Applies to**: All frameworks


**Source**: `src/rules/data/security.json`

---

### SEC_WEAK_RANDOM: Weak random for security tokens

**Severity**: HIGH | **Category**: security

Security tokens (password reset, session IDs) must use crypto.randomBytes() or crypto.randomUUID().

**What it catches:**
- Math.random() for password reset tokens
- Math.random() for session IDs
- Predictable tokens for authentication

**How to fix:**
- Use crypto.randomUUID()
- Use crypto.randomBytes() for tokens
- Never use Math.random() for security

**Recommendation**: Use cryptographically secure random
**Library**: Node.js crypto

**Applies to**: All frameworks


**Source**: `src/rules/data/security.json`

---

### SEC_X_CONTENT_TYPE: Missing X-Content-Type-Options

**Severity**: MEDIUM | **Category**: security

Prevents MIME type sniffing attacks.

**What it catches:**
- Missing X-Content-Type-Options header
- Browser MIME-sniffing enabled
- Scripts executed as wrong type

**How to fix:**
- Add X-Content-Type-Options: nosniff
- Use Helmet.js
- Set proper Content-Type headers

**Recommendation**: Add X-Content-Type-Options
**Library**: Helmet

**Applies to**: All frameworks


**Source**: `src/rules/data/security.json`

---

### SEC_X_FRAME_OPTIONS: Missing X-Frame-Options

**Severity**: MEDIUM | **Category**: security

Prevents clickjacking attacks by controlling iframe embedding.

**What it catches:**
- Missing X-Frame-Options header
- Site can be embedded in iframes
- Clickjacking attacks possible

**How to fix:**
- Add X-Frame-Options: DENY or SAMEORIGIN
- Use Helmet.js
- Configure in web server

**Recommendation**: Add X-Frame-Options header
**Library**: Helmet

**Applies to**: All frameworks


**Source**: `src/rules/data/security.json`

---

### SEC_XSS_VIA_INNERHTML: Potential XSS via innerHTML

**Severity**: HIGH | **Category**: security

Using innerHTML can lead to XSS attacks. Use textContent or sanitize input.

**What it catches:**
- Using innerHTML with user input
- dangerouslySetInnerHTML without sanitization
- v-html in Vue without sanitization

**How to fix:**
- Use textContent instead of innerHTML
- Sanitize HTML with DOMPurify before rendering
- Avoid dangerouslySetInnerHTML when possible

**Recommendation**: Avoid innerHTML
**Library**: DOM

**Applies to**: All frameworks


**Source**: `src/rules/data/security.json`

---

### SEC_XXE: XML External Entity vulnerability

**Severity**: CRITICAL | **Category**: security

XXE attacks can read local files. Disable external entity processing.

**What it catches:**
- XML parsing without disabling entities
- External entity references enabled
- Local file disclosure via XML

**How to fix:**
- Disable external entities in XML parser
- Use safe XML parsing libraries
- Validate and sanitize XML input

**Recommendation**: Disable XML external entities
**Library**: XML parser

**Applies to**: All frameworks
**File Extensions**: .js, .ts, .xml

**Source**: `src/rules/data/security.json`

---

### TRPC_NO_INPUT_SCHEMA: Procedure without input schema

**Severity**: MEDIUM | **Category**: security

Procedures should have Zod input schemas for validation.

**What it catches:**
- No input validation
- Invalid data processed
- Security vulnerabilities

**How to fix:**
- Add Zod schema to input
- Validate all procedure inputs
- Use .input(zodSchema)

**Recommendation**: Add input validation schema
**Library**: Zod

**Applies to**: nextjs, react


**Source**: `src/rules/data/trpc.json`

---

## State

### STATE_GLOBAL_MUTATION: Global state mutation

**Severity**: HIGH | **Category**: state

Mutating global state leads to unpredictable behavior.

**What it catches:**
- State changes hard to track
- Unexpected bugs from shared state
- Difficult debugging

**How to fix:**
- Use state management library
- Keep state local to components
- Use immutable patterns

**Recommendation**: Don't mutate global state
**Library**: State management

**Applies to**: All frameworks
**File Extensions**: .js, .ts, .tsx, .jsx

**Source**: `src/rules/data/state.json`

---

### STATE_USE_STATE_ARRAY: Direct array state mutation

**Severity**: MEDIUM | **Category**: state

Directly mutating state arrays won't trigger re-renders.

**What it catches:**
- UI not updating on changes
- Array mutations not detected
- Buggy behavior

**How to fix:**
- Create new array with spread or map
- Use Immer for immutable updates
- Return new array from setState

**Recommendation**: Use immutable state updates
**Library**: React

**Applies to**: react


**Source**: `src/rules/data/state.json`

---

## Testing

### AI_NO_TESTS: Files without corresponding tests

**Severity**: INFO | **Category**: testing

No corresponding test file found. Add tests to ensure code reliability.

**What it catches:**
- No test file for source file
- Code not covered by tests
- Higher risk of bugs

**How to fix:**
- Add corresponding test file
- Write unit/integration tests
- Aim for good coverage

**Recommendation**: Add tests for this file
**Library**: vitest, jest

**Applies to**: All frameworks
**File Extensions**: .test.ts, .spec.ts, .test.js, .spec.js

**Source**: `src/rules/data/ai-patterns.json`

---

### TEST_COVERAGE_CONFIG: Missing test coverage configuration

**Severity**: MEDIUM | **Category**: testing

Configure test coverage to track code quality. Add coverage configuration to your test runner.

**What it catches:**
- No visibility into code coverage
- Can't track tested code
- Unknown test quality

**How to fix:**
- Add coverage config to test runner
- Run coverage with tests
- Generate coverage reports

**Recommendation**: Add test coverage configuration
**Library**: vitest, jest

**Applies to**: All frameworks
**File Extensions**: .ts, .js, .json

**Source**: `src/rules/data/testing.json`

---

### TEST_COVERAGE_LOW: Test coverage below threshold

**Severity**: MEDIUM | **Category**: testing

Test coverage is below recommended threshold. Aim for 80%+ coverage.

**What it catches:**
- Code not tested
- Potential bugs undetected
- Low confidence in code

**How to fix:**
- Write more tests
- Aim for 80%+ coverage
- Prioritize critical paths

**Recommendation**: Improve test coverage
**Library**: vitest, jest

**Applies to**: All frameworks


**Source**: `src/rules/data/testing.json`

---

### TEST_COVERAGE_THRESHOLDS: Missing coverage thresholds

**Severity**: LOW | **Category**: testing

Add coverage thresholds to enforce minimum code coverage standards in CI.

**What it catches:**
- No enforcement of coverage
- Low coverage accepted
- Code quality issues

**How to fix:**
- Set coverage thresholds in config
- Fail CI below threshold
- Aim for 80%+ coverage

**Recommendation**: Set minimum coverage thresholds
**Library**: vitest, jest

**Applies to**: All frameworks


**Source**: `src/rules/data/testing.json`

---

### TEST_FILES_MISSING: Files without corresponding tests

**Severity**: MEDIUM | **Category**: testing

Source files should have corresponding test files.

**What it catches:**
- No tests for source files
- Untested functionality
- Risk of regressions

**How to fix:**
- Create test files for source
- Name tests matching source
- Cover critical paths

**Recommendation**: Add test files
**Library**: Testing

**Applies to**: All frameworks
**File Extensions**: .test.ts, .spec.ts, .test.js, .spec.js

**Source**: `src/rules/data/testing.json`

---

### TEST_NO_E2E: No E2E tests for UI project

**Severity**: MEDIUM | **Category**: testing

Projects with UI components should have E2E tests to verify user flows work correctly.

**What it catches:**
- No E2E tests for UI
- No browser testing
- User flows not tested

**How to fix:**
- Add Playwright or Cypress
- Write E2E tests for key user flows
- Test critical paths in real browser

**Recommendation**: Add E2E tests
**Library**: Playwright, Cypress

**Applies to**: All frameworks


**Source**: `src/rules/data/testing.json`

---

## Typescript

### REACT_COMPONENT_NO_TYPES: Component without PropTypes or TypeScript

**Severity**: LOW | **Category**: typescript

Components should have typed props for better maintainability and catch bugs early.

**What it catches:**
- React components without PropTypes
- Missing TypeScript types for props
- No type safety on components

**How to fix:**
- Add TypeScript interface for Props
- Use PropTypes for runtime validation
- Define component prop types

**Recommendation**: Add types to React components
**Library**: React, TypeScript

**Applies to**: react, nextjs


**Source**: `src/rules/data/react.json`

---

### TS_ANY_USAGE: Using 'any' type

**Severity**: MEDIUM | **Category**: typescript

Using `any` defeats TypeScript type safety. Use specific types or `unknown` if truly dynamic.

**What it catches:**
- Using 'any' type
- No type safety
- Defeats TypeScript purpose

**How to fix:**
- Use specific types
- Use 'unknown' for dynamic
- Define interfaces

**Recommendation**: Avoid using `any` type
**Library**: TypeScript

**Applies to**: All frameworks
**File Extensions**: .ts, .tsx

**Source**: `src/rules/data/typescript.json`

---

### TS_DISCRIMINATED_UNIONS: Missing discriminated unions

**Severity**: LOW | **Category**: typescript

Use discriminated unions for better type safety.

**What it catches:**
- No discriminated unions
- Hard to narrow types
- Missing type safety

**How to fix:**
- Add discriminant property
- Use discriminated unions
- Improve type narrowing

**Recommendation**: Use discriminated unions
**Library**: TypeScript

**Applies to**: All frameworks
**File Extensions**: .ts

**Source**: `src/rules/data/typescript.json`

---

### TS_ENUM_USAGE: Numeric enum usage

**Severity**: LOW | **Category**: typescript

Numeric enums have issues. Use const objects or string enums instead.

**What it catches:**
- Numeric enum used
- Reverse mapping issues
- Bundle size

**How to fix:**
- Use string enums
- Use const objects
- Use union types

**Recommendation**: Avoid numeric enums
**Library**: TypeScript

**Applies to**: All frameworks


**Source**: `src/rules/data/typescript.json`

---

### TS_FS_PROMISES: Missing fs/promises import

**Severity**: HIGH | **Category**: typescript

Import async functions from 'fs/promises' instead of 'fs'. The 'fs' module exports callback-based functions, not promises.

**What it catches:**
- Using callback-based fs
- No async/await support
- Code complexity

**How to fix:**
- Import from fs/promises
- Use async/await
- Simplify code

**Recommendation**: Use fs/promises for async file operations
**Library**: TypeScript

**Applies to**: All frameworks
**File Extensions**: .ts, .tsx, .js, .jsx

**Source**: `src/rules/data/typescript.json`

---

### TS_GENERIC_INFER: Consider explicit generic types

**Severity**: INFO | **Category**: typescript

Consider using explicit generic type parameters for clarity. This is a suggestion - ignore if your pattern is intentional.

**What it catches:**
- Generic inference may be unclear
- Type 'any' inferred in generics
- Hard to understand generic types

**How to fix:**
- Add explicit type parameters
- Fix generic constraints
- Improve type inference

**Recommendation**: Consider explicit generic types
**Library**: TypeScript

**Applies to**: All frameworks


**Source**: `src/rules/data/typescript.json`

---

### TS_IMPLICIT_ANY: Implicit any in function params

**Severity**: MEDIUM | **Category**: typescript

Function parameters without type annotations default to `any`. Add explicit types.

**What it catches:**
- Implicit any in function params
- No type checking
- Runtime errors

**How to fix:**
- Add explicit types
- Enable strict mode
- Fix parameter types

**Recommendation**: Add type annotation for implicit any
**Library**: TypeScript

**Applies to**: All frameworks
**File Extensions**: .ts, .tsx

**Source**: `src/rules/data/typescript.json`

---

### TS_INTERFACE_MERGE: Interface merging

**Severity**: LOW | **Category**: typescript

Interface merging can cause unexpected behavior. Use type aliases instead.

**What it catches:**
- Interface merging used
- Unexpected behavior
- Hard to debug

**How to fix:**
- Use type aliases
- Avoid interface merging
- Be explicit about types

**Recommendation**: Avoid interface merging
**Library**: TypeScript

**Applies to**: All frameworks


**Source**: `src/rules/data/typescript.json`

---

### TS_MISSING_RETURN_TYPE: Exported function missing return type

**Severity**: MEDIUM | **Category**: typescript

Exported functions should have explicit return types for better API documentation and type safety.

**What it catches:**
- Exported functions without return type
- Missing type annotations
- Inferred types that may change

**How to fix:**
- Add return type annotation
- Use explicit types for exports
- Document function signatures

**Recommendation**: Add return types to exported functions
**Library**: TypeScript

**Applies to**: All frameworks


**Source**: `src/rules/data/typescript.json`

---

### TS_NEVER_TYPE: Unhandled exhaustive cases

**Severity**: HIGH | **Category**: typescript

Use never type for exhaustive switch/case matching.

**What it catches:**
- Unhandled cases in switch
- Not exhaustive
- Runtime errors

**How to fix:**
- Use never type for exhaustiveness
- Add all cases
- Add compile-time checks

**Recommendation**: Ensure exhaustive matching
**Library**: TypeScript

**Applies to**: All frameworks


**Source**: `src/rules/data/typescript.json`

---

### TS_NO_IMPLICIT_ANY: Implicit any type

**Severity**: HIGH | **Category**: typescript

Variables without type annotations default to any. Enable strict mode.

**What it catches:**
- Implicit any type
- No type checking
- Runtime errors

**How to fix:**
- Enable noImplicitAny
- Add explicit types
- Use strict mode

**Recommendation**: Enable noImplicitAny
**Library**: TypeScript

**Applies to**: All frameworks
**File Extensions**: .json

**Source**: `src/rules/data/typescript.json`

---

### TS_OPTIONAL_CHAIN: Unsafe optional chaining depth

**Severity**: LOW | **Category**: typescript

Deep optional chaining can be hard to reason about. Consider explicit checks.

**What it catches:**
- Deep optional chaining
- Hard to reason about
- Potential runtime errors

**How to fix:**
- Use early returns
- Restructure objects
- Add null checks

**Recommendation**: Avoid unsafe optional chaining depth
**Library**: TypeScript

**Applies to**: All frameworks


**Source**: `src/rules/data/typescript.json`

---

### TS_OPTIONAL_PARAMS: Consider parameter ordering

**Severity**: INFO | **Category**: typescript

Consider putting required parameters before optional ones for clearer APIs. This is a suggestion - ignore if intentional.

**What it catches:**
- Optional params before required
- Confusing API design
- TypeScript pattern suggestion

**How to fix:**
- Reorder parameters
- Put required first
- Use optional at end

**Recommendation**: Consider parameter ordering
**Library**: TypeScript

**Applies to**: All frameworks


**Source**: `src/rules/data/typescript.json`

---

### TS_STRICT_NULL: Missing strict null checks

**Severity**: INFO | **Category**: typescript

Enable strictNullChecks to handle null/undefined properly.

**What it catches:**
- No strict null checks
- Null/undefined not handled
- Runtime errors

**How to fix:**
- Enable strictNullChecks
- Handle null/undefined
- Use optional chaining

**Recommendation**: Enable strictNullChecks
**Library**: TypeScript

**Applies to**: All frameworks


**Source**: `src/rules/data/typescript.json`

---

### TS_SYNC_FS_ASYNC: Synchronous fs in async function

**Severity**: HIGH | **Category**: typescript

Synchronous fs operations (readFileSync, writeFileSync, etc.) block the event loop. Use async versions from fs/promises.

**What it catches:**
- Sync fs in async function
- Blocks event loop
- Poor performance

**How to fix:**
- Use fs/promises
- Use async/await
- Don't block event loop

**Recommendation**: Use async fs functions in async contexts
**Library**: Node.js

**Applies to**: All frameworks
**File Extensions**: .ts, .tsx, .js, .jsx

**Source**: `src/rules/data/typescript.json`

---

### TS_TYPE_ASSERTION: Type assertion overriding TypeScript

**Severity**: MEDIUM | **Category**: typescript

Type assertions bypass TypeScript type checking. Use proper types.

**What it catches:**
- Type assertion used
- Bypasses type checking
- Potential runtime errors

**How to fix:**
- Use proper typing
- Avoid 'as' assertions
- Define interfaces

**Recommendation**: Avoid type assertions
**Library**: TypeScript

**Applies to**: All frameworks


**Source**: `src/rules/data/typescript.json`

---

### TS_TYPE_NARROWING: Insufficient type narrowing

**Severity**: INFO | **Category**: typescript

Use type guards and narrowing to ensure type safety.

**What it catches:**
- No type narrowing
- Type not narrowed
- Potential errors

**How to fix:**
- Use type guards
- Add instanceof checks
- Use typeof

**Recommendation**: Use proper type narrowing
**Library**: TypeScript

**Applies to**: All frameworks


**Source**: `src/rules/data/typescript.json`

---

### TS_TYPEOF_SAFETY: Unsafe typeof comparison

**Severity**: MEDIUM | **Category**: typescript

typeof is unreliable for complex type checks. Use Array.isArray(), instanceof, or strict equality checks.

**What it catches:**
- Unsafe typeof comparison
- Unreliable type checks
- Potential bugs

**How to fix:**
- Use Array.isArray()
- Use instanceof
- Use strict equality

**Recommendation**: Use proper type checking
**Library**: TypeScript

**Applies to**: All frameworks


**Source**: `src/rules/data/typescript.json`

---

### TS_UNUSED_VARS: Unused variables or imports

**Severity**: LOW | **Category**: typescript

Unused variables and imports reduce code quality.

**What it catches:**
- Unused variables/imports
- Dead code
- Code bloat

**How to fix:**
- Remove unused code
- Use noUnusedLocals
- Clean up imports

**Recommendation**: Remove unused code
**Library**: TypeScript

**Applies to**: All frameworks
**File Extensions**: .ts, .tsx

**Source**: `src/rules/data/typescript.json`

---

### VUE_EMIT_WITHOUT_DECLARE: Emits without declaration

**Severity**: MEDIUM | **Category**: typescript

Emits should be declared in the component for type safety.

**What it catches:**
- No type safety for emits
- Can't see emitted events
- Runtime errors

**How to fix:**
- Use defineEmits with type-safe events
- Define emits in component options
- Use TypeScript for full typing

**Recommendation**: Declare emits in component
**Library**: Vue

**Applies to**: vue, nuxt
**File Extensions**: .vue, .ts

**Source**: `src/rules/data/vue.json`

---

### VUE_STORE_ACTION_TYPE: String-based store actions

**Severity**: LOW | **Category**: typescript

String-based actions reduce type safety. Use typed actions.

**What it catches:**
- No type safety for actions
- Hard to refactor
- Magic strings

**How to fix:**
- Use Pinia with TypeScript
- Define action types explicitly
- Use composition API stores

**Recommendation**: Use typed store actions
**Library**: Pinia

**Applies to**: vue, nuxt


**Source**: `src/rules/data/vue.json`

---

## Uploads

### UPLOAD_NO_CHUNKING: Large files not using chunked upload

**Severity**: MEDIUM | **Category**: uploads

Large files should use resumable uploads for reliability.

**What it catches:**
- Large uploads fail easily
- No resume on failure
- Poor user experience

**How to fix:**
- Use tus or Uppy for uploads
- Enable resumable uploads
- Handle upload interruption

**Recommendation**: Implement chunked uploads
**Library**: tus, Uppy

**Applies to**: All frameworks
**File Extensions**: .ts, .js, .tsx, .jsx

**Source**: `src/rules/data/uploads.json`

---

### UPLOAD_NO_RENAME: Uploaded files not renamed

**Severity**: MEDIUM | **Category**: uploads

Don't use original filename. Generate UUID to prevent overwrites and path traversal.

**What it catches:**
- Files overwritten by duplicates
- Path traversal attacks
- Security vulnerabilities

**How to fix:**
- Generate UUID for filenames
- Store mapping to original name
- Never use user-provided names

**Recommendation**: Generate unique filenames
**Library**: uuid

**Applies to**: All frameworks
**File Extensions**: .ts, .js

**Source**: `src/rules/data/uploads.json`

---

### UPLOAD_NO_SIZE_LIMIT: Missing file size limit

**Severity**: HIGH | **Category**: uploads

Unlimited uploads can cause DoS. Set reasonable limits.

**What it catches:**
- No limit on upload size
- DoS via large files
- Server storage exhausted

**How to fix:**
- Set file size limit in middleware
- Validate file size before processing
- Return 413 on limit exceeded

**Recommendation**: Limit file upload sizes
**Library**: multer, express-fileupload

**Applies to**: All frameworks
**File Extensions**: .ts, .js

**Source**: `src/rules/data/uploads.json`

---

### UPLOAD_NO_STORAGE: Files stored locally in container

**Severity**: MEDIUM | **Category**: uploads

Store uploads in S3, GCS, or similar. Local storage is lost on restart.

**What it catches:**
- Files lost on restart
- No scalability
- Can't handle large files

**How to fix:**
- Use S3, GCS, or Azure Blob
- Configure proper bucket policies
- Enable versioning

**Recommendation**: Use object storage
**Library**: AWS S3, GCS, Azure Blob

**Applies to**: All frameworks
**File Extensions**: .ts, .js

**Source**: `src/rules/data/uploads.json`

---

### UPLOAD_NO_TYPE_CHECK: Missing file type validation

**Severity**: HIGH | **Category**: uploads

Check MIME type and extension. Don't trust client-provided types.

**What it catches:**
- Malicious files uploaded
- Server compromised
- No validation of content

**How to fix:**
- Check MIME type on server
- Verify file extension
- Use file-type library

**Recommendation**: Validate file types
**Library**: multer, file-type

**Applies to**: All frameworks
**File Extensions**: .ts, .js

**Source**: `src/rules/data/uploads.json`

---

### UPLOAD_NO_VIRUS_SCAN: Files not scanned for viruses

**Severity**: CRITICAL | **Category**: uploads

Scan files for malware before processing or storing.

**What it catches:**
- Malware uploaded to server
- Virus spread to users
- Security breach

**How to fix:**
- Integrate ClamAV scanner
- Scan before storing
- Quarantine suspicious files

**Recommendation**: Scan uploaded files
**Library**: ClamAV, virus-scan

**Applies to**: All frameworks
**File Extensions**: .ts, .js

**Source**: `src/rules/data/uploads.json`

---

## Usability

### MOBILE_DEEP_LINK: No deep linking support

**Severity**: LOW | **Category**: usability

Support deep links to specific app screens from external URLs.

**What it catches:**
- No direct links to app screens
- Users can't share specific content
- Poor discoverability

**How to fix:**
- Implement URL schemes
- Add universal links (iOS) / app links (Android)
- Handle links in navigation

**Recommendation**: Add deep linking
**Library**: Deep Linking

**Applies to**: react-native, flutter


**Source**: `src/rules/data/mobile.json`

---

### MOBILE_NO_PWA: PWA not installed

**Severity**: LOW | **Category**: usability

Progressive Web Apps provide better mobile experience with install prompt.

**What it catches:**
- No install prompt for PWA
- Missing from home screen
- No offline capability

**How to fix:**
- Create Web App Manifest
- Register service worker
- Add install prompt handling

**Recommendation**: Consider PWA
**Library**: PWA

**Applies to**: All frameworks


**Source**: `src/rules/data/mobile.json`

---

### MOBILE_NO_SPLASH: Missing splash screen

**Severity**: LOW | **Category**: usability

Splash screens improve perceived startup time on mobile.

**What it catches:**
- White flash on app load
- Poor perceived performance
- Inconsistent user experience

**How to fix:**
- Add splash screen to manifest
- Configure theme color
- Set loading screen background

**Recommendation**: Add splash screen
**Library**: PWA

**Applies to**: pwa


**Source**: `src/rules/data/mobile.json`

---

### MOBILE_NOTCH_IGNORE: Notch/safe area not handled

**Severity**: MEDIUM | **Category**: usability

Use env(safe-area-inset-*) for notches and system UI.

**What it catches:**
- Content hidden under notch
- Buttons behind status bar
- UI obscured by device cutouts

**How to fix:**
- Use safe-area-inset CSS properties
- Add env(safe-area-inset-*) padding
- Test on devices with notches

**Recommendation**: Handle safe areas
**Library**: CSS

**Applies to**: All frameworks


**Source**: `src/rules/data/mobile.json`

---

### MOBILE_ORIENTATION: No orientation handling

**Severity**: LOW | **Category**: usability

App should handle both portrait and landscape orientations.

**What it catches:**
- Layout broken in landscape
- Content hidden on orientation change
- Poor multi-orientation support

**How to fix:**
- Add CSS media queries for orientation
- Test in both orientations
- Use responsive layouts

**Recommendation**: Handle orientation changes
**Library**: CSS, JavaScript

**Applies to**: All frameworks


**Source**: `src/rules/data/mobile.json`

---

### MOBILE_SWIPE_CONFLICT: Swipe gestures may conflict with browser

**Severity**: LOW | **Category**: usability

Custom swipe gestures may conflict with browser navigation. Add prevention.

**What it catches:**
- Browser navigation conflicts with app gestures
- Unexpected back navigation
- Poor gesture experience

**How to fix:**
- Call preventDefault on touchmove carefully
- Use passive: false for event listeners
- Test gestures on real devices

**Recommendation**: Handle swipe conflicts
**Library**: JavaScript

**Applies to**: All frameworks


**Source**: `src/rules/data/mobile.json`

---

### MOBILE_VIEWPORT: Missing viewport meta tag

**Severity**: HIGH | **Category**: usability

Viewport meta tag is required for proper mobile rendering.

**What it catches:**
- Page not scaled for mobile
- Tiny text on small screens
- Poor mobile experience

**How to fix:**
- Add viewport meta tag to HTML head
- Set width=device-width, initial-scale=1
- Test on actual mobile devices

**Recommendation**: Add viewport meta tag
**Library**: HTML

**Applies to**: All frameworks


**Source**: `src/rules/data/mobile.json`

---

### USE_MISSING_HELP: Missing CLI help

**Severity**: MEDIUM | **Category**: usability

CLI should provide --help flag with usage information.

**What it catches:**
- Users can't get help
- Hard to learn CLI
- Poor documentation

**How to fix:**
- Add --help option
- Show usage examples
- Document all options

**Recommendation**: Add help command
**Library**: CLI

**Applies to**: All frameworks
**File Extensions**: .ts

**Source**: `src/rules/data/usability.json`

---

### USE_MISSING_VERSION: Missing CLI version

**Severity**: LOW | **Category**: usability

CLI should provide --version flag.

**What it catches:**
- Users can't check version
- Hard to debug issues
- No version info

**How to fix:**
- Add --version option
- Show current version
- Configure version in package

**Recommendation**: Add version flag
**Library**: CLI

**Applies to**: All frameworks
**File Extensions**: .ts

**Source**: `src/rules/data/usability.json`

---

### USE_NO_CONFIRMATION: No confirmation for destructive actions

**Severity**: HIGH | **Category**: usability

Destructive actions should require user confirmation.

**What it catches:**
- Accidental destructive action
- Data loss
- No chance to cancel

**How to fix:**
- Add confirmation prompt
- Require explicit yes/no
- Show what will happen

**Recommendation**: Add confirmation prompts
**Library**: CLI

**Applies to**: All frameworks
**File Extensions**: .ts, .js

**Source**: `src/rules/data/usability.json`

---

### USE_NO_ERROR_STATE: No Error State

**Severity**: MEDIUM | **Category**: usability

Components should handle error states gracefully.

**What it catches:**
- Crashed UI with no feedback
- Blank screens on errors
- Poor user experience

**How to fix:**
- Add error boundaries
- Show error messages to users
- Provide fallback UI

**Recommendation**: Add error state handling
**Library**: Error handling

**Applies to**: react, vue, svelte


**Source**: `src/rules/data/usability.json`

---

### USE_NO_PROGRESS: No progress indicator for long operations

**Severity**: MEDIUM | **Category**: usability

Long-running operations should show progress indicators.

**What it catches:**
- User unsure if app working
- Appears frozen
- Poor experience

**How to fix:**
- Add progress spinner/loader
- Show percentage for known duration
- Use loading states

**Recommendation**: Add progress indicator
**Library**: CLI, UI

**Applies to**: All frameworks
**File Extensions**: .ts, .js

**Source**: `src/rules/data/usability.json`

---

### USE_NO_SUGGESTIONS: No command suggestions for typos

**Severity**: LOW | **Category**: usability

CLI should suggest correct commands when users make typos.

**What it catches:**
- Typo leads to confusion
- Users don't know correct command
- Frustrating experience

**How to fix:**
- Enable suggestCommands
- Show similar command names
- Help users correct typos

**Recommendation**: Add command suggestions
**Library**: CLI

**Applies to**: All frameworks
**File Extensions**: .ts, .js

**Source**: `src/rules/data/usability.json`

---

## Websockets

### WS_NO_AUTH: WebSocket without authentication

**Severity**: CRITICAL | **Category**: websockets

WebSocket connections should be authenticated on handshake.

**What it catches:**
- Unauthenticated connections
- Security vulnerabilities
- Anyone can connect

**How to fix:**
- Pass token on handshake
- Validate on connection
- Use middleware

**Recommendation**: Authenticate WebSocket connections
**Library**: socket.io, ws

**Applies to**: All frameworks
**File Extensions**: .ts, .js

**Source**: `src/rules/data/websockets.json`

---

### WS_NO_HEARTBEAT: WebSocket missing heartbeat

**Severity**: HIGH | **Category**: websockets

Heartbeats detect disconnected clients and prevent stale connections.

**What it catches:**
- Dead connections not detected
- Stale connections using resources
- Ghost clients

**How to fix:**
- Implement ping/pong heartbeat
- Set heartbeat interval
- Handle disconnection

**Recommendation**: Implement heartbeat/ping-pong
**Library**: ws, socket.io

**Applies to**: All frameworks
**File Extensions**: .ts, .js

**Source**: `src/rules/data/websockets.json`

---

### WS_NO_MESSAGE_TYPES: Using string messages instead of typed objects

**Severity**: LOW | **Category**: websockets

Use JSON with type field for better debugging and validation.

**What it catches:**
- String messages hard to debug
- No validation
- Type errors at runtime

**How to fix:**
- Use JSON with type field
- Define message schemas
- Validate on receive

**Recommendation**: Use typed message format
**Library**: socket.io, ws

**Applies to**: All frameworks
**File Extensions**: .ts, .js

**Source**: `src/rules/data/websockets.json`

---

### WS_NO_RATE_LIMIT: WebSocket missing rate limiting

**Severity**: MEDIUM | **Category**: websockets

Limit message frequency per client to prevent abuse.

**What it catches:**
- Client can flood with messages
- DoS vulnerability
- Server overload

**How to fix:**
- Add rate limiter middleware
- Limit messages per second
- Throttle per connection

**Recommendation**: Rate limit messages
**Library**: socket.io rate limiter

**Applies to**: All frameworks
**File Extensions**: .ts, .js

**Source**: `src/rules/data/websockets.json`

---

### WS_NO_RECONNECT: Client missing reconnection logic

**Severity**: MEDIUM | **Category**: websockets

Auto-reconnect when connection is lost.

**What it catches:**
- App stops working on disconnect
- Manual refresh required
- Poor user experience

**How to fix:**
- Enable auto-reconnect
- Handle reconnection events
- Update UI on reconnect

**Recommendation**: Add reconnection handling
**Library**: socket.io-client, ws

**Applies to**: All frameworks
**File Extensions**: .ts, .js

**Source**: `src/rules/data/websockets.json`

---

### WS_ROOM_BROADCAST: Broadcasting to all instead of rooms

**Severity**: MEDIUM | **Category**: websockets

Broadcast to specific rooms rather than all connected clients.

**What it catches:**
- Messages sent to everyone
- Data leaked to wrong users
- Wasted bandwidth

**How to fix:**
- Use socket.io rooms
- Join user to room by ID
- Broadcast to specific room

**Recommendation**: Use rooms for targeted broadcasts
**Library**: socket.io rooms

**Applies to**: All frameworks
**File Extensions**: .ts, .js

**Source**: `src/rules/data/websockets.json`

---

