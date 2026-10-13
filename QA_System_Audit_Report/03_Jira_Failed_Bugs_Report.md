# Ձախողված Թեստերի Հաշվետվություն Jira-ի համար

Նշում՝ այս բաժինը պարունակում է բոլոր failed Test Case-ները և Security Vulnerability-ները, որոնք պատրաստ են Jira import-ի համար։

## Jira Issue 1: Auth Page validation and error handling weaknesses

**Jira Issue Title**: Auth Page validation and error handling weaknesses

**Issue Type**: Bug

**Severity & Priority**: High / High

**Environment / Component**: Auth Page / Form Validation

**Description & Plain Language Impact**: The auth form does not provide strong validation and recovery for invalid user input and broken session flows. Users may be unable to sign in or may see confusing error states.

**Steps to Reproduce**:
1. 1. Open Auth page.
2. 2. Submit empty or malformed input.
3. 3. Observe validation and recovery behavior.

**Expected Result**: The form should reject invalid input and show clear instructions.

**Actual Result**: The page accepts weak validation and may leave users in unclear failure states.

**Logs / Technical Evidence / Stack Trace**: src/pages/Auth.tsx; npm run lint

---

## Jira Issue 2: Session persistence is unreliable after refresh

**Jira Issue Title**: Session persistence is unreliable after refresh

**Issue Type**: Bug

**Severity & Priority**: High / High

**Environment / Component**: Session Management / Auth State

**Description & Plain Language Impact**: Session persistence depends on fragmented environment state and may fail in production-like conditions. Users can appear signed out or lose progress unexpectedly.

**Steps to Reproduce**:
1. 1. Log in.
2. 2. Refresh page.
3. 3. Review session recovery state.

**Expected Result**: The application should keep the authenticated state after reload.

**Actual Result**: Session continuity fails under certain environment conditions.

**Logs / Technical Evidence / Stack Trace**: src/integrations/supabase/client.ts; src/contexts/AuthContext.tsx

---

## Jira Issue 3: Content list rendering is inconsistent for empty and populated states

**Jira Issue Title**: Content list rendering is inconsistent for empty and populated states

**Issue Type**: Bug

**Severity & Priority**: Medium / Medium

**Environment / Component**: Library Page / Content List

**Description & Plain Language Impact**: The library page does not consistently handle empty data and populated data states. Users may see blank or broken content sections.

**Steps to Reproduce**:
1. 1. Open Library with no content.
2. 2. Open Library with records.
3. 3. Compare UI state.

**Expected Result**: The UI should handle both states clearly.

**Actual Result**: The states are inconsistent and can confuse users.

**Logs / Technical Evidence / Stack Trace**: src/pages/Library.tsx; src/hooks/useContent.ts

---

## Jira Issue 4: Content Detail page shows stale or mismatched content state

**Jira Issue Title**: Content Detail page shows stale or mismatched content state

**Issue Type**: Bug

**Severity & Priority**: High / Medium

**Environment / Component**: Content Detail / Data Fetch

**Description & Plain Language Impact**: The page can load stale or incomplete content due to data flow and hook issues. Users may read the wrong content or see incomplete records.

**Steps to Reproduce**:
1. 1. Open a content item.
2. 2. Update or reload data.
3. 3. Observe details shown.

**Expected Result**: The page should always reflect the selected item.

**Actual Result**: The display may mismatch the selected content record.

**Logs / Technical Evidence / Stack Trace**: src/pages/ContentDetail.tsx; src/hooks/useContent.ts

---

## Jira Issue 5: Chat error recovery remains weak under backend failure

**Jira Issue Title**: Chat error recovery remains weak under backend failure

**Issue Type**: Bug

**Severity & Priority**: High / Medium

**Environment / Component**: Chat Panel / API Error Handling

**Description & Plain Language Impact**: Chat requests fail without consistent recovery messaging and state handling. Users may think the app froze or lost their message.

**Steps to Reproduce**:
1. 1. Trigger chat error.
2. 2. Send another message.
3. 3. Observe UI recovery.

**Expected Result**: The chat should recover and display an actionable message.

**Actual Result**: The error state is inconsistent and brittle.

**Logs / Technical Evidence / Stack Trace**: src/components/ChatPanel.tsx; supabase/functions/content-chat/index.ts

---

## Jira Issue 6: Flashcards and Quiz flows are unstable for data variations

**Jira Issue Title**: Flashcards and Quiz flows are unstable for data variations

**Issue Type**: Bug

**Severity & Priority**: Medium / Medium

**Environment / Component**: Flashcards / Quiz

**Description & Plain Language Impact**: The quiz and flashcard logic breaks when content structure varies. Users may not be able to study correctly.

**Steps to Reproduce**:
1. 1. Load flashcards.
2. 2. Load quiz.
3. 3. Check answer validation and state updates.

**Expected Result**: The app should handle different content structures reliably.

**Actual Result**: The answer flow is fragile.

**Logs / Technical Evidence / Stack Trace**: src/pages/FlashcardsPage.tsx; src/pages/Quiz.tsx

---

## Jira Issue 7: Billing and subscription status can become stale

**Jira Issue Title**: Billing and subscription status can become stale

**Issue Type**: Bug

**Severity & Priority**: High / Medium

**Environment / Component**: Billing / Subscription State

**Description & Plain Language Impact**: The billing page can display stale subscription information after auth changes. Users may be shown wrong plan or usage information.

**Steps to Reproduce**:
1. 1. Open Billing page.
2. 2. Change auth state.
3. 3. Refresh subscription status.

**Expected Result**: The app should show current billing state.

**Actual Result**: State can drift and remain stale.

**Logs / Technical Evidence / Stack Trace**: src/pages/Billing.tsx; src/hooks/useUsageLimit.ts

---

## Jira Issue 8: OAuth consent flow is incomplete or inconsistent

**Jira Issue Title**: OAuth consent flow is incomplete or inconsistent

**Issue Type**: Bug

**Severity & Priority**: High / High

**Environment / Component**: OAuth Consent / Authorization Flow

**Description & Plain Language Impact**: The authorization flow does not fully validate all consent states. Users may approve or deny a request without a fully trusted context.

**Steps to Reproduce**:
1. 1. Open OAuthConsent without valid auth details.
2. 2. Trigger approval or denial.
3. 3. Observe redirect and errors.

**Expected Result**: The flow should reject incomplete requests and validate redirect destinations.

**Actual Result**: The flow can continue in partial or inconsistent state.

**Logs / Technical Evidence / Stack Trace**: src/pages/OAuthConsent.tsx; src/integrations/supabase/client.ts

---

## Jira Issue 9: Audio generation workflow fails under resource pressure

**Jira Issue Title**: Audio generation workflow fails under resource pressure

**Issue Type**: Bug

**Severity & Priority**: High / High

**Environment / Component**: Audio Generation / Media Processing

**Description & Plain Language Impact**: Generate-audio flow can fail when payload size or load increases. Users may lose output generation or wait indefinitely.

**Steps to Reproduce**:
1. 1. Upload or generate large audio content.
2. 2. Repeat generation workflow.
3. 3. Observe result and timeout.

**Expected Result**: The system should manage heavy workloads gracefully.

**Actual Result**: Audio generation is fragile under load.

**Logs / Technical Evidence / Stack Trace**: src/utils/ffmpegMix.ts; app/api/generate-audio/route.ts

---

## Jira Issue 10: Account deletion and cleanup flow is not fully reliable

**Jira Issue Title**: Account deletion and cleanup flow is not fully reliable

**Issue Type**: Bug

**Severity & Priority**: High / High

**Environment / Component**: Delete Account / Cleanup

**Description & Plain Language Impact**: User account cleanup does not fully validate all state transitions. Users may lose trust if their account is only partially removed.

**Steps to Reproduce**:
1. 1. Trigger delete-account flow.
2. 2. Verify cleanup and session end.
3. 3. Check residual data.

**Expected Result**: The system should remove accounts cleanly and clearly.

**Actual Result**: Cleanup flow may be incomplete.

**Logs / Technical Evidence / Stack Trace**: src/components/SettingsModal.tsx; supabase/functions/delete-account/index.ts

---

## Jira Issue 11: Mobile experience is inconsistent on small viewports

**Jira Issue Title**: Mobile experience is inconsistent on small viewports

**Issue Type**: Bug

**Severity & Priority**: Medium / Medium

**Environment / Component**: Responsive Layout / Mobile UX

**Description & Plain Language Impact**: The responsive layout does not consistently handle small screen interactions. Mobile users may find the app difficult to navigate.

**Steps to Reproduce**:
1. 1. Resize to mobile width.
2. 2. Open forms and menus.
3. 3. Verify usability.

**Expected Result**: The app should remain usable on small screens.

**Actual Result**: Small screen layout and interactions are inconsistent.

**Logs / Technical Evidence / Stack Trace**: src/components/BottomInputBar/BottomInputBar.tsx; src/pages/Landing.tsx

---

## Jira Issue 12: SQL Injection risk remains in data layer review

**Jira Issue Title**: SQL Injection risk remains in data layer review

**Issue Type**: Security Vulnerability

**Severity & Priority**: Critical / High

**Environment / Component**: Database Access / Supabase Layer

**Description & Plain Language Impact**: Data access patterns and query controls are not consistently hardened against injection or unsafe input. A malicious payload could expose user data or interfere with records.

**Steps to Reproduce**:
1. 1. Review query patterns.
2. 2. Feed suspicious input to content queries.
3. 3. Check DB-side validation.

**Expected Result**: All data access should be validated and scoped.

**Actual Result**: The risk remains unresolved from the static review.

**Logs / Technical Evidence / Stack Trace**: src/hooks/useContent.ts; supabase/functions/content-chat/index.ts

---

## Jira Issue 13: XSS risk exists in user-generated content rendering

**Jira Issue Title**: XSS risk exists in user-generated content rendering

**Issue Type**: Security Vulnerability

**Severity & Priority**: Critical / High

**Environment / Component**: Markdown Rendering / Content Display

**Description & Plain Language Impact**: User-generated content is rendered with insufficient sanitization controls. Attackers can inject scripts or malicious HTML into content views.

**Steps to Reproduce**:
1. 1. Submit HTML or script payload.
2. 2. Render in MarkdownRenderer.
3. 3. Observe output.

**Expected Result**: The app should sanitize content before rendering.

**Actual Result**: Unsafe content is not reliably sanitized.

**Logs / Technical Evidence / Stack Trace**: src/components/MarkdownRenderer.tsx; src/pages/ContentDetail.tsx

---

## Jira Issue 14: CSRF and redirect tampering are weak in OAuth flow

**Jira Issue Title**: CSRF and redirect tampering are weak in OAuth flow

**Issue Type**: Security Vulnerability

**Severity & Priority**: Critical / High

**Environment / Component**: OAuth Redirect / State Validation

**Description & Plain Language Impact**: Redirect targets and authorization responses are trusted without strict validation. Users may be redirected to phishing or malicious destinations.

**Steps to Reproduce**:
1. 1. Trigger OAuth approval.
2. 2. Modify redirect_url.
3. 3. Observe browser navigation.

**Expected Result**: Redirect targets must be validated and restricted to trusted origins.

**Actual Result**: Unsafe redirect targets remain possible.

**Logs / Technical Evidence / Stack Trace**: src/pages/OAuthConsent.tsx

---

## Jira Issue 15: Authorization bypass risk on protected content access

**Jira Issue Title**: Authorization bypass risk on protected content access

**Issue Type**: Security Vulnerability

**Severity & Priority**: Critical / High

**Environment / Component**: Authorization / Access Control

**Description & Plain Language Impact**: Protected content access is not uniformly validated across user sessions and routes. Unauthorized users may access restricted data.

**Steps to Reproduce**:
1. 1. Query content without valid session.
2. 2. Try protected route access.
3. 3. Inspect auth checks.

**Expected Result**: Only authorized users should access protected data.

**Actual Result**: Access control is not consistently enforced.

**Logs / Technical Evidence / Stack Trace**: src/hooks/useContent.ts; src/pages/ChatPage.tsx

---

## Jira Issue 16: Secret and configuration exposure risks exist due to fallback placeholders

**Jira Issue Title**: Secret and configuration exposure risks exist due to fallback placeholders

**Issue Type**: Security Vulnerability

**Severity & Priority**: Critical / Critical

**Environment / Component**: Environment Variables / Secret Management

**Description & Plain Language Impact**: The app falls back to placeholder values instead of failing securely. Production environments can operate in a dangerous misconfigured state.

**Steps to Reproduce**:
1. 1. Start app without env vars.
2. 2. Inspect runtime client config.
3. 3. Review logs.

**Expected Result**: The app should fail before running with missing config.

**Actual Result**: It continues using placeholder values.

**Logs / Technical Evidence / Stack Trace**: src/integrations/supabase/client.ts

---

## Jira Issue 17: Session fixation and stale session handling are not fully controlled

**Jira Issue Title**: Session fixation and stale session handling are not fully controlled

**Issue Type**: Security Vulnerability

**Severity & Priority**: High / High

**Environment / Component**: Session Lifecycle / Auth Security

**Description & Plain Language Impact**: Session state can remain stale through auth transitions. Users may reuse old or invalid sessions.

**Steps to Reproduce**:
1. 1. Log in, log out, and relogin.
2. 2. Observe session continuity.
3. 3. Check token reuse.

**Expected Result**: The app should issue fresh, validated session states.

**Actual Result**: Session handling is not fully hardened.

**Logs / Technical Evidence / Stack Trace**: src/hooks/useAuth.ts; src/contexts/AuthContext.tsx

---

## Jira Issue 18: localStorage settings can be tampered with and trusted without checks

**Jira Issue Title**: localStorage settings can be tampered with and trusted without checks

**Issue Type**: Security Vulnerability

**Severity & Priority**: Medium / Medium

**Environment / Component**: Browser Storage / Settings

**Description & Plain Language Impact**: User settings are stored and read without strict validation. A malicious or corrupted value can affect the UI or language status.

**Steps to Reproduce**:
1. 1. Modify localStorage data.
2. 2. Reload app.
3. 3. Check settings behavior.

**Expected Result**: Settings should be validated and sanitized.

**Actual Result**: The app trusts unverified localStorage values.

**Logs / Technical Evidence / Stack Trace**: src/lib/settings.ts

---

## Jira Issue 19: Rate limiting and abuse prevention are insufficient for AI workloads

**Jira Issue Title**: Rate limiting and abuse prevention are insufficient for AI workloads

**Issue Type**: Security Vulnerability

**Severity & Priority**: High / High

**Environment / Component**: Rate Limit / AI Abuse Control

**Description & Plain Language Impact**: AI and content requests can be retried without proper throttling and abuse protection. Attackers can spam heavy requests and degrade the service.

**Steps to Reproduce**:
1. 1. Trigger repeated analysis calls.
2. 2. Observe backend behavior.
3. 3. Review retry pattern.

**Expected Result**: The system should enforce throttling and rate limits.

**Actual Result**: Rate limiting remains weak.

**Logs / Technical Evidence / Stack Trace**: src/lib/analyzeText.ts; supabase/functions/analyze-text/index.ts

---

## Jira Issue 20: Media and file validation is incomplete for attachment flows

**Jira Issue Title**: Media and file validation is incomplete for attachment flows

**Issue Type**: Security Vulnerability

**Severity & Priority**: High / High

**Environment / Component**: File Upload / Media Validation

**Description & Plain Language Impact**: Large or malformed content is only partially validated. Attackers can trigger denial-of-service or resource failures.

**Steps to Reproduce**:
1. 1. Send oversized file.
2. 2. Send malformed media file.
3. 3. Observe validation path.

**Expected Result**: Files should be restricted and sanitized.

**Actual Result**: Validation remains incomplete.

**Logs / Technical Evidence / Stack Trace**: src/lib/analyzeText.ts

---

## Jira Issue 21: Authorization and forbidden responses are not correctly classified

**Jira Issue Title**: Authorization and forbidden responses are not correctly classified

**Issue Type**: Security Vulnerability

**Severity & Priority**: High / Medium

**Environment / Component**: API Error Handling / Access Control

**Description & Plain Language Impact**: Error paths between unauthorized and forbidden cases are ambiguous. Users may get misleading status and permission messages.

**Steps to Reproduce**:
1. 1. Test unauthorized access.
2. 2. Test forbidden access.
3. 3. Review response handling.

**Expected Result**: Unauthorized and forbidden conditions should map clearly to results.

**Actual Result**: Error classification is inconsistent.

**Logs / Technical Evidence / Stack Trace**: src/lib/analyzeText.ts; supabase/functions/generate-podcast/index.ts

---

## Jira Issue 22: Markdown and HTML content injection is still a risk

**Jira Issue Title**: Markdown and HTML content injection is still a risk

**Issue Type**: Security Vulnerability

**Severity & Priority**: High / High

**Environment / Component**: Content Rendering / Markdown

**Description & Plain Language Impact**: Generated content can still be rendered unsafely. Content injection can manipulate pages or mislead users.

**Steps to Reproduce**:
1. 1. Send malicious markdown.
2. 2. Render in UI.
3. 3. Observe unsafe output.

**Expected Result**: Rendering should sanitize and filter malicious content.

**Actual Result**: Unsafe content may still appear.

**Logs / Technical Evidence / Stack Trace**: src/components/MarkdownRenderer.tsx

---

## Jira Issue 23: Dependency and supply-chain exposure remains significant

**Jira Issue Title**: Dependency and supply-chain exposure remains significant

**Issue Type**: Security Vulnerability

**Severity & Priority**: Medium / Medium

**Environment / Component**: Dependency Management / Supply Chain

**Description & Plain Language Impact**: The project has a broad dependency surface with limited hardening evidence. A compromised dependency could affect the application.

**Steps to Reproduce**:
1. 1. Review package manifest.
2. 2. Check dependency hygiene.
3. 3. Assess exposure risk.

**Expected Result**: The project should minimize and monitor risk surface.

**Actual Result**: The dependency footprint remains broad.

**Logs / Technical Evidence / Stack Trace**: package.json

---

## Jira Issue 24: Sensitive data exposure and logs are not sufficiently protected

**Jira Issue Title**: Sensitive data exposure and logs are not sufficiently protected

**Issue Type**: Security Vulnerability

**Severity & Priority**: High / Medium

**Environment / Component**: Logging / Sensitive Data Handling

**Description & Plain Language Impact**: User and error details may be logged or exposed too broadly. Sensitive user details could be shown to unintended parties.

**Steps to Reproduce**:
1. 1. Trigger auth and API errors.
2. 2. Review logs and UI messages.
3. 3. Inspect exposure.

**Expected Result**: The app should minimize sensitive data exposure.

**Actual Result**: Sensitive details can leak through logs and messages.

**Logs / Technical Evidence / Stack Trace**: src/lib/analyzeText.ts; src/components/ChatPanel.tsx

---

## Jira Issue 25: Password and credential handling standards are not strongly enforced

**Jira Issue Title**: Password and credential handling standards are not strongly enforced

**Issue Type**: Security Vulnerability

**Severity & Priority**: High / High

**Environment / Component**: Authentication / Credential Handling

**Description & Plain Language Impact**: Credentials are not strongly protected by policy enforcement in the current UI flow. Users may rely on weak or unvalidated stored credentials.

**Steps to Reproduce**:
1. 1. Review auth form validation.
2. 2. Check credential handling in flow.
3. 3. Inspect stored state.

**Expected Result**: The auth flow should enforce strong input and secure handling.

**Actual Result**: Credentials are not robustly governed.

**Logs / Technical Evidence / Stack Trace**: src/pages/Auth.tsx

---

## Jira Issue 26: External API trust boundaries are not strongly validated

**Jira Issue Title**: External API trust boundaries are not strongly validated

**Issue Type**: Security Vulnerability

**Severity & Priority**: High / Medium

**Environment / Component**: External API Integration / Trust Boundary

**Description & Plain Language Impact**: The app depends on AI and media services without strict validation rules for remote response and origin trust. Malicious or malformed service responses could redirect or destabilize flows.

**Steps to Reproduce**:
1. 1. Inspect external API calls.
2. 2. Simulate malformed response.
3. 3. Review trust boundary.

**Expected Result**: The app should validate all external responses and origins.

**Actual Result**: Trusted domain and response validation remain weak.

**Logs / Technical Evidence / Stack Trace**: src/lib/analyzeText.ts; src/pages/ContentDetail.tsx

---

## Jira Issue 27: Protected routes and auth gating are not uniformly enforced

**Jira Issue Title**: Protected routes and auth gating are not uniformly enforced

**Issue Type**: Security Vulnerability

**Severity & Priority**: High / High

**Environment / Component**: Route Protection / Auth Gating

**Description & Plain Language Impact**: Not all protected routes are equally hardened against anonymous access. Unauthorized users may reach areas they should not.

**Steps to Reproduce**:
1. 1. Attempt access to protected pages.
2. 2. Check route-level gating.
3. 3. Inspect redirects.

**Expected Result**: Protected pages should require valid session checks.

**Actual Result**: Some routes are not enforced consistently.

**Logs / Technical Evidence / Stack Trace**: src/App.tsx; src/pages/Dashboard.tsx

---

## Jira Issue 28: Invalid payload rejection is inconsistent

**Jira Issue Title**: Invalid payload rejection is inconsistent

**Issue Type**: Bug

**Severity & Priority**: High / Medium

**Environment / Component**: API Endpoint / analyze-text

**Description & Plain Language Impact**: The API wrapper does not always reject invalid payloads cleanly. Users may get unclear failures or backend errors.

**Steps to Reproduce**:
1. 1. Send empty or malformed body to analyze-text.
2. 2. Check response code.
3. 3. Review error handling.

**Expected Result**: The API should return a clear validation error.

**Actual Result**: Invalid payloads are not consistently rejected.

**Logs / Technical Evidence / Stack Trace**: src/lib/analyzeText.ts; supabase/functions/analyze-text/index.ts

---

## Jira Issue 29: Retry behavior misclassifies some failure types

**Jira Issue Title**: Retry behavior misclassifies some failure types

**Issue Type**: Bug

**Severity & Priority**: Medium / Medium

**Environment / Component**: API Endpoint / Retry Logic

**Description & Plain Language Impact**: Some errors are retried even when they are not transient. The app wastes API calls and frustrates users.

**Steps to Reproduce**:
1. 1. Trigger 429 and 5xx conditions.
2. 2. Check retry triggers.
3. 3. Observe final message.

**Expected Result**: Retry should only occur for transient errors.

**Actual Result**: Retry logic is too broad.

**Logs / Technical Evidence / Stack Trace**: src/lib/analyzeText.ts

---

## Jira Issue 30: Podcast generation timeout and network failure handling remains weak

**Jira Issue Title**: Podcast generation timeout and network failure handling remains weak

**Issue Type**: Bug

**Severity & Priority**: High / Medium

**Environment / Component**: API Endpoint / generate-podcast

**Description & Plain Language Impact**: Network or timeout failures are not handled uniformly. Users can experience hanging or incomplete generation flows.

**Steps to Reproduce**:
1. 1. Simulate timeout.
2. 2. Trigger slow response.
3. 3. Observe flow.

**Expected Result**: The platform should recover and show clear guidance.

**Actual Result**: Failure handling is weak under slow or failed calls.

**Logs / Technical Evidence / Stack Trace**: supabase/functions/generate-podcast/index.ts

---

## Jira Issue 31: content-chat response schema and payload validation is unstable

**Jira Issue Title**: content-chat response schema and payload validation is unstable

**Issue Type**: Bug

**Severity & Priority**: Medium / Medium

**Environment / Component**: API Endpoint / content-chat

**Description & Plain Language Impact**: The chat API does not consistently validate payloads and output schema. Parsing errors can break UI and backend trust.

**Steps to Reproduce**:
1. 1. Send empty or malformed chat content.
2. 2. Validate returned schema.
3. 3. Observe UI behavior.

**Expected Result**: The API should validate schema and respond clearly.

**Actual Result**: Schema validation is inconsistent.

**Logs / Technical Evidence / Stack Trace**: supabase/functions/content-chat/index.ts

---

## Jira Issue 32: CORS and Origin validation requires hardening

**Jira Issue Title**: CORS and Origin validation requires hardening

**Issue Type**: Bug

**Severity & Priority**: High / High

**Environment / Component**: API Security / CORS

**Description & Plain Language Impact**: Origin validation should be stronger to prevent unsafe cross-origin requests. A malicious website may attempt to abuse the backend.

**Steps to Reproduce**:
1. 1. Test cross-origin requests.
2. 2. Review allowed origins.
3. 3. Inspect behavior.

**Expected Result**: Only trusted origins should access the API.

**Actual Result**: CORS trust is not sufficiently constrained.

**Logs / Technical Evidence / Stack Trace**: supabase/functions/**

---

## Jira Issue 33: Rate limit behavior is inconsistent for auth and anonymous requests

**Jira Issue Title**: Rate limit behavior is inconsistent for auth and anonymous requests

**Issue Type**: Bug

**Severity & Priority**: Medium / Medium

**Environment / Component**: API Rate Limit / Abuse Prevention

**Description & Plain Language Impact**: The API does not consistently enforce rate limits across request types. The platform can be abused by repeated requests.

**Steps to Reproduce**:
1. 1. Attempt repeated requests.
2. 2. Compare anonymous versus authenticated.
3. 3. Check status codes.

**Expected Result**: The system should throttle abusive traffic.

**Actual Result**: Rate limit handling is inconsistent.

**Logs / Technical Evidence / Stack Trace**: supabase/functions/analyze-text/index.ts

---

## Jira Issue 34: Expired session handling is not robust for protected endpoints

**Jira Issue Title**: Expired session handling is not robust for protected endpoints

**Issue Type**: Bug

**Severity & Priority**: High / Medium

**Environment / Component**: Protected Endpoint / Session Expiry

**Description & Plain Language Impact**: Expired sessions may still retain access or show stale state. Users can see protected content without a valid session.

**Steps to Reproduce**:
1. 1. Expire session token.
2. 2. Request protected endpoint.
3. 3. Review response.

**Expected Result**: Expired sessions should force login or deny access.

**Actual Result**: The protection flow is weak.

**Logs / Technical Evidence / Stack Trace**: src/hooks/useAuth.ts; src/pages/ChatPage.tsx

---

## Jira Issue 35: HTTP status correctness is inconsistent for create/update/delete flows

**Jira Issue Title**: HTTP status correctness is inconsistent for create/update/delete flows

**Issue Type**: Bug

**Severity & Priority**: Medium / Medium

**Environment / Component**: API Contract / HTTP Status

**Description & Plain Language Impact**: Create/update/delete operations do not always map to accurate HTTP results. The app and client may misinterpret failures.

**Steps to Reproduce**:
1. 1. Perform create/update/delete calls.
2. 2. Inspect status codes.
3. 3. Review client logic.

**Expected Result**: The API should clearly distinguish validation and server fault states.

**Actual Result**: Status semantics are mixed.

**Logs / Technical Evidence / Stack Trace**: supabase/functions/**

---

## Jira Issue 36: Delete endpoint idempotency and state recovery are weak

**Jira Issue Title**: Delete endpoint idempotency and state recovery are weak

**Issue Type**: Bug

**Severity & Priority**: Medium / Medium

**Environment / Component**: Delete API / Data Cleanup

**Description & Plain Language Impact**: Repeated deletion requests and stale state handling are not robust. Users may see incorrect deletion states or orphaned data.

**Steps to Reproduce**:
1. 1. Delete the same item twice.
2. 2. Observe response.
3. 3. Check UI state.

**Expected Result**: Delete behavior should be idempotent and predictable.

**Actual Result**: The flow is fragile under repeated requests.

**Logs / Technical Evidence / Stack Trace**: src/hooks/useContent.ts

---

## Jira Issue 37: Response caching and stale data policy remain unverified

**Jira Issue Title**: Response caching and stale data policy remain unverified

**Issue Type**: Bug

**Severity & Priority**: Medium / Medium

**Environment / Component**: Data Freshness / Response Caching

**Description & Plain Language Impact**: Repeated API calls can continue to show stale data. Users can work from outdated information.

**Steps to Reproduce**:
1. 1. Request same endpoint repeatedly.
2. 2. Change underlying data.
3. 3. Validate cache invalidation.

**Expected Result**: The app should revalidate stale data.

**Actual Result**: Caching behavior is not clearly controlled.

**Logs / Technical Evidence / Stack Trace**: src/hooks/useContent.ts

---

## Jira Issue 38: Model accuracy is inconsistent for short content with simple factual tasks

**Jira Issue Title**: Model accuracy is inconsistent for short content with simple factual tasks

**Issue Type**: Bug

**Severity & Priority**: High / Medium

**Environment / Component**: AI Accuracy / Text Analysis

**Description & Plain Language Impact**: The model output can vary in quality for short but nuanced tasks. Users may rely on incomplete or low-quality summaries.

**Steps to Reproduce**:
1. 1. Submit concise content.
2. 2. Review output quality.
3. 3. Compare with expected result.

**Expected Result**: The model should maintain consistent quality for short tasks.

**Actual Result**: The output quality varies unexpectedly.

**Logs / Technical Evidence / Stack Trace**: src/lib/analyzeText.ts

---

## Jira Issue 39: Long input truncation degrades model quality and user trust

**Jira Issue Title**: Long input truncation degrades model quality and user trust

**Issue Type**: Bug

**Severity & Priority**: High / Medium

**Environment / Component**: AI Input Limits / Long Content

**Description & Plain Language Impact**: Large inputs are truncated without clear guidance or quality safeguards. Users may receive incomplete or misleading output.

**Steps to Reproduce**:
1. 1. Submit near-limit input.
2. 2. Observe truncation and output quality.
3. 3. Review error handling.

**Expected Result**: The app should explain limits and maintain output quality.

**Actual Result**: Large inputs trigger degradation.

**Logs / Technical Evidence / Stack Trace**: src/lib/analyzeText.ts

---

## Jira Issue 40: Bias and fairness review on educational generation is incomplete

**Jira Issue Title**: Bias and fairness review on educational generation is incomplete

**Issue Type**: Bug

**Severity & Priority**: High / Medium

**Environment / Component**: AI Fairness / Bias Assessment

**Description & Plain Language Impact**: The educational content generator may reflect uneven tone or perspective. This can reduce trust in learning materials and mislead users.

**Steps to Reproduce**:
1. 1. Submit content across groups and contexts.
2. 2. Compare outputs.
3. 3. Review tone and fairness.

**Expected Result**: The model should produce balanced responses.

**Actual Result**: Bias checks are incomplete.

**Logs / Technical Evidence / Stack Trace**: supabase/functions/analyze-text/index.ts

---

## Jira Issue 41: Hallucination risk remains on factual prompts

**Jira Issue Title**: Hallucination risk remains on factual prompts

**Issue Type**: Bug

**Severity & Priority**: Critical / High

**Environment / Component**: AI Reliability / Factual Grounding

**Description & Plain Language Impact**: Generated responses may include unsupported or fabricated claims. Users may trust incorrect educational output.

**Steps to Reproduce**:
1. 1. Submit factual request.
2. 2. Compare with known facts.
3. 3. Review unsupported claims.

**Expected Result**: The response should stick to source content.

**Actual Result**: Hallucination risk remains.

**Logs / Technical Evidence / Stack Trace**: src/lib/analyzeText.ts

---

## Jira Issue 42: Context retention is not stable across multi-turn interactions

**Jira Issue Title**: Context retention is not stable across multi-turn interactions

**Issue Type**: Bug

**Severity & Priority**: High / Medium

**Environment / Component**: AI Conversation / Context Memory

**Description & Plain Language Impact**: Multi-turn chat can lose or distort conversation context. Users may get inconsistent responses across turns.

**Steps to Reproduce**:
1. 1. Ask a follow-up after initial prompt.
2. 2. Compare context continuity.
3. 3. Observe output drift.

**Expected Result**: The app should retain relevant conversation context.

**Actual Result**: Context continuity is weak.

**Logs / Technical Evidence / Stack Trace**: supabase/functions/content-chat/index.ts

---

## Jira Issue 43: Prompt length and token overflow behavior remains risky

**Jira Issue Title**: Prompt length and token overflow behavior remains risky

**Issue Type**: Bug

**Severity & Priority**: Medium / Medium

**Environment / Component**: AI Prompt Limits / Token Management

**Description & Plain Language Impact**: Near-limit prompts can degrade output quality or fail unpredictably. Users may unexpectedly receive truncated or unusable results.

**Steps to Reproduce**:
1. 1. Submit prompts near token limits.
2. 2. Observe output.
3. 3. Check guidance.

**Expected Result**: The app should handle limits predictably.

**Actual Result**: Prompt handling still breaks down under heavy loads.

**Logs / Technical Evidence / Stack Trace**: src/lib/analyzeText.ts

---

## Jira Issue 44: Structured output validation for generated study materials is unreliable

**Jira Issue Title**: Structured output validation for generated study materials is unreliable

**Issue Type**: Bug

**Severity & Priority**: High / Medium

**Environment / Component**: AI Output Schema / Structured Response

**Description & Plain Language Impact**: Generated outputs do not always conform to expected data structure. Downstream parsing and UI rendering may fail.

**Steps to Reproduce**:
1. 1. Generate structured response.
2. 2. Validate required keys.
3. 3. Check parsing behavior.

**Expected Result**: The output structure should be consistent.

**Actual Result**: The schema is not always reliable.

**Logs / Technical Evidence / Stack Trace**: supabase/functions/analyze-text/index.ts

---

## Jira Issue 45: Sensitive user content is not sufficiently protected in AI prompts

**Jira Issue Title**: Sensitive user content is not sufficiently protected in AI prompts

**Issue Type**: Security Vulnerability

**Severity & Priority**: Critical / High

**Environment / Component**: AI Privacy / Data Handling

**Description & Plain Language Impact**: Private or sensitive content may be processed without strong minimization or redaction. Users may lose privacy confidence in the system.

**Steps to Reproduce**:
1. 1. Submit sensitive notes.
2. 2. Review how prompts are formed.
3. 3. Check storage or logs.

**Expected Result**: Sensitive data should be minimized and protected.

**Actual Result**: Privacy controls are not sufficiently strong.

**Logs / Technical Evidence / Stack Trace**: src/lib/analyzeText.ts

---

## Jira Issue 46: Fallback behavior for AI outage is incomplete

**Jira Issue Title**: Fallback behavior for AI outage is incomplete

**Issue Type**: Bug

**Severity & Priority**: High / Medium

**Environment / Component**: AI Service Availability / Fallback Handling

**Description & Plain Language Impact**: The system has retry logic but not fully stable fallback messaging or recovery. Users may feel stuck when the AI service is unavailable.

**Steps to Reproduce**:
1. 1. Simulate service outage.
2. 2. Trigger the generation flow.
3. 3. Observe fallback and recovery.

**Expected Result**: The app should show meaningful fallback guidance.

**Actual Result**: Fallback or recovery remains weak.

**Logs / Technical Evidence / Stack Trace**: src/lib/analyzeText.ts

---

## Jira Issue 47: Determinism and repeatability of AI summary generation is weak

**Jira Issue Title**: Determinism and repeatability of AI summary generation is weak

**Issue Type**: Bug

**Severity & Priority**: Medium / Medium

**Environment / Component**: AI Determinism / Output Consistency

**Description & Plain Language Impact**: The same input can yield materially different outputs. Users may doubt the quality and reliability of the system.

**Steps to Reproduce**:
1. 1. Submit same content twice.
2. 2. Compare outputs.
3. 3. Review variance.

**Expected Result**: The output should be sufficiently consistent.

**Actual Result**: Responses vary beyond acceptable tolerance.

**Logs / Technical Evidence / Stack Trace**: supabase/functions/analyze-text/index.ts

---

## Jira Issue 48: Tool and external system boundaries for AI workflow need stronger control

**Jira Issue Title**: Tool and external system boundaries for AI workflow need stronger control

**Issue Type**: Security Vulnerability

**Severity & Priority**: High / High

**Environment / Component**: AI Tool Access / Trust Boundary

**Description & Plain Language Impact**: AI-driven workflows may interact with external systems without strong user-trust control. Unchecked tool access can create unsafe outcomes.

**Steps to Reproduce**:
1. 1. Review external tools and service access.
2. 2. Simulate tool invocation.
3. 3. Inspect boundaries.

**Expected Result**: Only intended and validated tools should be used.

**Actual Result**: Boundary controls are not strong enough.

**Logs / Technical Evidence / Stack Trace**: src/lib/mcp/index.ts; src/lib/mcp/tools/**

---

## Jira Issue 49: AI output sanitization and UI-safe rendering remains risky

**Jira Issue Title**: AI output sanitization and UI-safe rendering remains risky

**Issue Type**: Security Vulnerability

**Severity & Priority**: High / High

**Environment / Component**: AI Output Rendering / Sanitization

**Description & Plain Language Impact**: The generated answer may still contain dangerous markup or misleading structure. Users may encounter unsafe content or invalid UI state.

**Steps to Reproduce**:
1. 1. Submit markdown-heavy or malicious output.
2. 2. Render in app UI.
3. 3. Observe result.

**Expected Result**: Outputs should be sanitized before display.

**Actual Result**: Unsafe rendering risk remains.

**Logs / Technical Evidence / Stack Trace**: src/components/MarkdownRenderer.tsx

---

## Jira Issue 50: User profile creation and update logic is inconsistent

**Jira Issue Title**: User profile creation and update logic is inconsistent

**Issue Type**: Bug

**Severity & Priority**: High / Medium

**Environment / Component**: Database / Profile Management

**Description & Plain Language Impact**: Profile records can be created or updated inconsistently across auth changes. Users can have missing or invalid account data.

**Steps to Reproduce**:
1. 1. Create profile.
2. 2. Update profile data.
3. 3. Check records.

**Expected Result**: Profile creation should be consistent and validated.

**Actual Result**: Profile data integrity is weak.

**Logs / Technical Evidence / Stack Trace**: supabase/migrations/**; src/hooks/useAuth.ts

---

## Jira Issue 51: Content-to-user relationship integrity is weak

**Jira Issue Title**: Content-to-user relationship integrity is weak

**Issue Type**: Bug

**Severity & Priority**: High / Medium

**Environment / Component**: Database / User-Content Mapping

**Description & Plain Language Impact**: The relationship between user records and content records is not fully guaranteed. Users may access or manipulate content incorrectly.

**Steps to Reproduce**:
1. 1. Create content as a user.
2. 2. Query by user ID.
3. 3. Compare data mapping.

**Expected Result**: Content should belong to the correct user only.

**Actual Result**: Mapping integrity is inconsistent.

**Logs / Technical Evidence / Stack Trace**: src/hooks/useContent.ts

---

## Jira Issue 52: Null handling and default values for profile fields are not fully controlled

**Jira Issue Title**: Null handling and default values for profile fields are not fully controlled

**Issue Type**: Bug

**Severity & Priority**: Medium / Medium

**Environment / Component**: Database / Data Validation

**Description & Plain Language Impact**: Optional profile fields can produce null or undefined states without proper defaults. The app may break when users have incomplete records.

**Steps to Reproduce**:
1. 1. Insert missing optional fields.
2. 2. Query and render profile.
3. 3. Check behavior.

**Expected Result**: The system should normalize null values.

**Actual Result**: Null handling remains weak.

**Logs / Technical Evidence / Stack Trace**: supabase/migrations/**

---

## Jira Issue 53: Deletion and referential integrity are incomplete

**Jira Issue Title**: Deletion and referential integrity are incomplete

**Issue Type**: Bug

**Severity & Priority**: High / Medium

**Environment / Component**: Database / Cleanup and Referential Integrity

**Description & Plain Language Impact**: Removing a content item or related records may leave orphaned data behind. The system can accumulate stale or inconsistent records.

**Steps to Reproduce**:
1. 1. Delete a content record.
2. 2. Check related tables.
3. 3. Validate cleanup.

**Expected Result**: The system should clean dependent data reliably.

**Actual Result**: Referential integrity is not fully ensured.

**Logs / Technical Evidence / Stack Trace**: src/hooks/useContent.ts

---

## Jira Issue 54: Large dataset handling is not stable at scale

**Jira Issue Title**: Large dataset handling is not stable at scale

**Issue Type**: Bug

**Severity & Priority**: High / Medium

**Environment / Component**: Database / Performance Under Load

**Description & Plain Language Impact**: Large inserts and query volumes may produce slower or unstable behavior. Users may experience delayed data loads and poor reliability.

**Steps to Reproduce**:
1. 1. Insert large batch.
2. 2. Query content list.
3. 3. Observe performance.

**Expected Result**: The app should scale with larger datasets.

**Actual Result**: Large data handling remains risky.

**Logs / Technical Evidence / Stack Trace**: src/hooks/useContent.ts

---

## Jira Issue 55: Transaction rollback and partial-failure recovery are not proven

**Jira Issue Title**: Transaction rollback and partial-failure recovery are not proven

**Issue Type**: Bug

**Severity & Priority**: High / Medium

**Environment / Component**: Database / Transactions

**Description & Plain Language Impact**: Transactional safety is not fully verified for multi-step writes. Partial writes can leave inconsistent records.

**Steps to Reproduce**:
1. 1. Trigger a write failure mid-process.
2. 2. Check persisted data.
3. 3. Observe rollback results.

**Expected Result**: The system should enforce atomicity.

**Actual Result**: Rollback behavior is unverified.

**Logs / Technical Evidence / Stack Trace**: supabase/functions/**

---

## Jira Issue 56: Audit trail or traceability for user account changes is insufficient

**Jira Issue Title**: Audit trail or traceability for user account changes is insufficient

**Issue Type**: Bug

**Severity & Priority**: Medium / Medium

**Environment / Component**: Database / Auditability

**Description & Plain Language Impact**: User and content lifecycle changes are not clearly traceable. Compliance and support teams may not be able to reconstruct events.

**Steps to Reproduce**:
1. 1. Review account change paths.
2. 2. Assess traceability.
3. 3. Inspect required logs.

**Expected Result**: The system should record key state changes.

**Actual Result**: Auditability is insufficient.

**Logs / Technical Evidence / Stack Trace**: supabase/migrations/**

---

## Jira Issue 57: Retention and archival policies for generated content are not clear

**Jira Issue Title**: Retention and archival policies for generated content are not clear

**Issue Type**: Bug

**Severity & Priority**: Medium / Medium

**Environment / Component**: Database / Data Retention

**Description & Plain Language Impact**: Generated content and media may not have a defined retention lifecycle. The business may accumulate unnecessary data and risk privacy issues.

**Steps to Reproduce**:
1. 1. Review generated content retention paths.
2. 2. Check storage lifecycle.
3. 3. Validate cleanup.

**Expected Result**: The system should define retention and cleanup rules.

**Actual Result**: Retention policy is unclear.

**Logs / Technical Evidence / Stack Trace**: supabase/functions/generate-podcast/index.ts

---

## Jira Issue 58: Concurrent multi-user updates can cause data integrity issues

**Jira Issue Title**: Concurrent multi-user updates can cause data integrity issues

**Issue Type**: Bug

**Severity & Priority**: High / High

**Environment / Component**: Database / Concurrency

**Description & Plain Language Impact**: The system could suffer lost updates or stale writes under concurrent access. Users may overwrite each other’s data or see inconsistent records.

**Steps to Reproduce**:
1. 1. Simulate concurrent updates.
2. 2. Check final state.
3. 3. Validate integrity.

**Expected Result**: The system should handle concurrent updates safely.

**Actual Result**: Concurrency controls are not validated.

**Logs / Technical Evidence / Stack Trace**: src/hooks/useContent.ts

---

## Jira Issue 59: Sensitive data classification and access control review is incomplete

**Jira Issue Title**: Sensitive data classification and access control review is incomplete

**Issue Type**: Security Vulnerability

**Severity & Priority**: High / High

**Environment / Component**: Database / Data Classification

**Description & Plain Language Impact**: The project stores sensitive educational and user-generated content without enough access-control evidence. User trust and privacy can be harmed if data is improperly exposed.

**Steps to Reproduce**:
1. 1. Review stored content categories.
2. 2. Inspect access controls.
3. 3. Evaluate sensitivity.

**Expected Result**: Sensitive content should have stricter access controls.

**Actual Result**: Data classification controls are insufficient.

**Logs / Technical Evidence / Stack Trace**: supabase/functions/**

---

## Jira Issue 60: Audio output device fallback is unreliable

**Jira Issue Title**: Audio output device fallback is unreliable

**Issue Type**: Bug

**Severity & Priority**: Medium / Medium

**Environment / Component**: Audio Device Integration / Playback

**Description & Plain Language Impact**: Audio playback can fail when output devices are absent or change. Users may not hear generated audio or may see confusing behavior.

**Steps to Reproduce**:
1. 1. Change output device.
2. 2. Trigger playback.
3. 3. Observe fallback behavior.

**Expected Result**: The app should degrade gracefully if audio device is unavailable.

**Actual Result**: Audio fallback handling is weak.

**Logs / Technical Evidence / Stack Trace**: src/components/PodcastPlayer.tsx

---

## Jira Issue 61: External service protocol reliability is not fully resilient

**Jira Issue Title**: External service protocol reliability is not fully resilient

**Issue Type**: Bug

**Severity & Priority**: High / Medium

**Environment / Component**: External Service Integration / Network Reliability

**Description & Plain Language Impact**: The system relies on remote services without robust resilience and recovery. Users may lose access to AI or podcast generation during brief outages.

**Steps to Reproduce**:
1. 1. Simulate network drops.
2. 2. Trigger external generation.
3. 3. Monitor behavior.

**Expected Result**: The system should recover gracefully from external service interruptions.

**Actual Result**: Transport resilience remains weak.

**Logs / Technical Evidence / Stack Trace**: supabase/functions/**; src/lib/analyzeText.ts

---

## Jira Issue 62: API-to-UI communication is unstable under latency spikes

**Jira Issue Title**: API-to-UI communication is unstable under latency spikes

**Issue Type**: Bug

**Severity & Priority**: High / Medium

**Environment / Component**: Frontend Connectivity / UI State

**Description & Plain Language Impact**: Under latency the UI may remain stuck or stale. Users may think the application has crashed.

**Steps to Reproduce**:
1. 1. Simulate network delay.
2. 2. Trigger content load.
3. 3. Observe UI state.

**Expected Result**: The UI should show loading and recovery states clearly.

**Actual Result**: Latency handling is weak.

**Logs / Technical Evidence / Stack Trace**: src/components/ChatPanel.tsx; src/pages/ContentDetail.tsx

---

## Jira Issue 63: OAuth provider compatibility is not fully hardened

**Jira Issue Title**: OAuth provider compatibility is not fully hardened

**Issue Type**: Bug

**Severity & Priority**: High / High

**Environment / Component**: OAuth Provider / External Identity Integration

**Description & Plain Language Impact**: The app depends on external identity providers and may fail under provider-specific edge cases. Users may get stuck in sign-in or consent flows.

**Steps to Reproduce**:
1. 1. Trigger OAuth consent flow.
2. 2. Vary provider response shape.
3. 3. Observe redirect handling.

**Expected Result**: The app should support provider-specific variations safely.

**Actual Result**: Provider compatibility is not fully reliable.

**Logs / Technical Evidence / Stack Trace**: src/pages/OAuthConsent.tsx

---

## Jira Issue 64: Background tab and app state resilience is weak

**Jira Issue Title**: Background tab and app state resilience is weak

**Issue Type**: Bug

**Severity & Priority**: Medium / Medium

**Environment / Component**: Browser State / Background Activity

**Description & Plain Language Impact**: The app may behave unpredictably when tabs are backgrounded or resumed. Users may lose work or see stale results.

**Steps to Reproduce**:
1. 1. Switch tabs during generation.
2. 2. Resume app.
3. 3. Observe state.

**Expected Result**: The app should resume predictably.

**Actual Result**: Background resilience is under-validated.

**Logs / Technical Evidence / Stack Trace**: src/components/PodcastPlayer.tsx

---

## Jira Issue 65: Connection interruption recovery is incomplete

**Jira Issue Title**: Connection interruption recovery is incomplete

**Issue Type**: Bug

**Severity & Priority**: High / Medium

**Environment / Component**: Network Recovery / Offline State

**Description & Plain Language Impact**: The app does not fully recover when connection drops during requests. Users may see no clear path to continue.

**Steps to Reproduce**:
1. 1. Drop network mid-request.
2. 2. Resume connection.
3. 3. Observe state.

**Expected Result**: The app should recover or retry gracefully.

**Actual Result**: Recovery is inconsistent.

**Logs / Technical Evidence / Stack Trace**: src/lib/analyzeText.ts

---

## Jira Issue 66: End-to-end pipeline between frontend, AI, and Supabase remains fragile

**Jira Issue Title**: End-to-end pipeline between frontend, AI, and Supabase remains fragile

**Issue Type**: Bug

**Severity & Priority**: Critical / High

**Environment / Component**: Integration Pipeline / End-to-End Flow

**Description & Plain Language Impact**: Multiple external systems are involved, and partial failures can break the entire flow. Users may lose generated content or see inconsistent states.

**Steps to Reproduce**:
1. 1. Trigger full workflow.
2. 2. Introduce partial failure.
3. 3. Observe results.

**Expected Result**: The full pipeline should remain coherent under partial failures.

**Actual Result**: Pipeline resilience is weak.

**Logs / Technical Evidence / Stack Trace**: src/pages/ContentDetail.tsx; src/lib/analyzeText.ts

---

## Jira Issue 67: Large content rendering slows the interface significantly

**Jira Issue Title**: Large content rendering slows the interface significantly

**Issue Type**: Bug

**Severity & Priority**: High / Medium

**Environment / Component**: Frontend Performance / Large Data Rendering

**Description & Plain Language Impact**: The app becomes sluggish when content lists or pages contain large amounts of data. Users may experience delay, lag, or poor responsiveness.

**Steps to Reproduce**:
1. 1. Load large content set.
2. 2. Open detail pages.
3. 3. Observe render stability.

**Expected Result**: The app should remain responsive even with large content.

**Actual Result**: Rendering time and responsiveness degrade.

**Logs / Technical Evidence / Stack Trace**: src/pages/Library.tsx; src/pages/ContentDetail.tsx

---

## Jira Issue 68: Memory usage grows during repeated AI and audio workflows

**Jira Issue Title**: Memory usage grows during repeated AI and audio workflows

**Issue Type**: Bug

**Severity & Priority**: High / Medium

**Environment / Component**: Memory / Repeated Heavy Workflows

**Description & Plain Language Impact**: Repeated generation tasks can increase memory usage over time. The app may become unstable during repeated use.

**Steps to Reproduce**:
1. 1. Repeat generation multiple times.
2. 2. Observe memory and stability.
3. 3. Monitor browser health.

**Expected Result**: The app should manage memory effectively.

**Actual Result**: Memory grows and can degrade runtime stability.

**Logs / Technical Evidence / Stack Trace**: src/utils/ffmpegMix.ts; src/lib/analyzeText.ts

---

## Jira Issue 69: Knowledge Map operations can create CPU spikes and jank

**Jira Issue Title**: Knowledge Map operations can create CPU spikes and jank

**Issue Type**: Bug

**Severity & Priority**: Medium / Medium

**Environment / Component**: Performance / Visualization Rendering

**Description & Plain Language Impact**: The graph and node-intensive UI can be slow under update loads. Users may see visible lag during map interaction.

**Steps to Reproduce**:
1. 1. Open large graph.
2. 2. Move or update nodes.
3. 3. Observe smoothness.

**Expected Result**: The app should remain responsive.

**Actual Result**: CPU spikes create visual lag.

**Logs / Technical Evidence / Stack Trace**: src/components/KnowledgeMap/KnowledgeMap.tsx

---

## Jira Issue 70: Audio and media processing is resource-heavy under load

**Jira Issue Title**: Audio and media processing is resource-heavy under load

**Issue Type**: Bug

**Severity & Priority**: High / Medium

**Environment / Component**: Media Processing / Performance

**Description & Plain Language Impact**: Large media processing can take too long or fail. Users may feel the product is unreliable during content generation.

**Steps to Reproduce**:
1. 1. Process larger audio payloads.
2. 2. Measure output time.
3. 3. Observe failure or timeout.

**Expected Result**: The system should keep processing times reasonable.

**Actual Result**: Media processing is too resource-intensive.

**Logs / Technical Evidence / Stack Trace**: src/utils/ffmpegMix.ts

---

## Jira Issue 71: Storage growth from repeated saves and generated outputs is not bounded

**Jira Issue Title**: Storage growth from repeated saves and generated outputs is not bounded

**Issue Type**: Bug

**Severity & Priority**: Medium / Medium

**Environment / Component**: Storage / Browser State Growth

**Description & Plain Language Impact**: Repeated generation and page interactions cause state growth. Users may face capacity or slowdowns over time.

**Steps to Reproduce**:
1. 1. Repeat generation.
2. 2. Inspect browser storage.
3. 3. Observe data growth.

**Expected Result**: Storage should remain bounded or cleaned up.

**Actual Result**: Growth is not properly controlled.

**Logs / Technical Evidence / Stack Trace**: src/lib/settings.ts; src/hooks/useContent.ts

---

## Jira Issue 72: UI freezes under multiple concurrent tasks

**Jira Issue Title**: UI freezes under multiple concurrent tasks

**Issue Type**: Bug

**Severity & Priority**: High / Medium

**Environment / Component**: Frontend Responsiveness / Concurrency

**Description & Plain Language Impact**: Parallel tasks and updates can freeze the interface. Users cannot continue interacting with the product.

**Steps to Reproduce**:
1. 1. Trigger several tasks at once.
2. 2. Observe UI responsiveness.
3. 3. Check freeze behavior.

**Expected Result**: The app should preserve responsiveness.

**Actual Result**: The UI can freeze under moderate simultaneous load.

**Logs / Technical Evidence / Stack Trace**: src/components/ChatPanel.tsx; src/pages/ContentDetail.tsx

---

## Jira Issue 73: Search and filter performance degrades with larger content sets

**Jira Issue Title**: Search and filter performance degrades with larger content sets

**Issue Type**: Bug

**Severity & Priority**: Medium / Medium

**Environment / Component**: Search / Filter Performance

**Description & Plain Language Impact**: Search operations become slower as more content is added. Users may experience slow queries and stale result sets.

**Steps to Reproduce**:
1. 1. Load large content repo.
2. 2. Search and filter records.
3. 3. Observe timing.

**Expected Result**: The system should stay responsive as the data set grows.

**Actual Result**: Performance degrades under volume.

**Logs / Technical Evidence / Stack Trace**: src/pages/Library.tsx

---

## Jira Issue 74: Memory retention after navigation and unmount is not fully verified

**Jira Issue Title**: Memory retention after navigation and unmount is not fully verified

**Issue Type**: Bug

**Severity & Priority**: Medium / Medium

**Environment / Component**: Frontend Memory Cleanup / Navigation

**Description & Plain Language Impact**: Page transitions may leave references alive after unmounting. Memory can accumulate and harm long sessions.

**Steps to Reproduce**:
1. 1. Navigate between pages repeatedly.
2. 2. Check memory profile.
3. 3. Observe cleanup.

**Expected Result**: The app should clean references on unmount.

**Actual Result**: Memory cleanup remains weak.

**Logs / Technical Evidence / Stack Trace**: src/components/KnowledgeMap/KnowledgeMap.tsx

---

## Jira Issue 75: Token and content size limits are not explained clearly during heavy AI use

**Jira Issue Title**: Token and content size limits are not explained clearly during heavy AI use

**Issue Type**: Bug

**Severity & Priority**: Medium / Medium

**Environment / Component**: AI Performance / User Guidance

**Description & Plain Language Impact**: Large prompts produce unstable or partial results without enough guidance. Users may be confused by failures and wasted effort.

**Steps to Reproduce**:
1. 1. Send large prompt.
2. 2. Observe result and message.
3. 3. Check explanation quality.

**Expected Result**: The app should guide users on limits and retries.

**Actual Result**: Guidance remains weak.

**Logs / Technical Evidence / Stack Trace**: src/lib/analyzeText.ts

---

## Jira Issue 76: Retry and backend coordination degrade responsiveness under latency stress

**Jira Issue Title**: Retry and backend coordination degrade responsiveness under latency stress

**Issue Type**: Bug

**Severity & Priority**: High / Medium

**Environment / Component**: API Performance / Retry Coordination

**Description & Plain Language Impact**: Retrials under latency stress can create a poor user experience. Users may wait too long and see stale states.

**Steps to Reproduce**:
1. 1. Simulate delay and retries.
2. 2. Observe network and UI states.
3. 3. Check responsiveness.

**Expected Result**: The app should degrade gracefully under latency.

**Actual Result**: Latency and retries reduce responsiveness.

**Logs / Technical Evidence / Stack Trace**: src/lib/analyzeText.ts

---

## Jira Issue 77: Auth regression after session changes and refresh cycles

**Jira Issue Title**: Auth regression after session changes and refresh cycles

**Issue Type**: Bug

**Severity & Priority**: High / Medium

**Environment / Component**: Auth Regression / Session Stability

**Description & Plain Language Impact**: The authentication flow remains unstable through repeated logins and re-auth. Users can get locked out or see stale login state.

**Steps to Reproduce**:
1. 1. Login.
2. 2. Logout and login again.
3. 3. Verify session continuity.

**Expected Result**: The system should produce stable auth state each time.

**Actual Result**: Auth regression remains active.

**Logs / Technical Evidence / Stack Trace**: src/hooks/useAuth.ts; src/contexts/AuthContext.tsx

---

## Jira Issue 78: Content creation and deletion regression is still present

**Jira Issue Title**: Content creation and deletion regression is still present

**Issue Type**: Bug

**Severity & Priority**: High / Medium

**Environment / Component**: Content Regression / CRUD Flow

**Description & Plain Language Impact**: Create and delete flows can leave stale data and mismatched states. Users can lose trust in content management features.

**Steps to Reproduce**:
1. 1. Create a content item.
2. 2. Delete it.
3. 3. Verify cleanup and UI state.

**Expected Result**: Create and delete should both behave predictably.

**Actual Result**: Some state cleanup remains inconsistent.

**Logs / Technical Evidence / Stack Trace**: src/hooks/useContent.ts

---

## Jira Issue 79: Settings and language persistence regression after reload

**Jira Issue Title**: Settings and language persistence regression after reload

**Issue Type**: Bug

**Severity & Priority**: Medium / Medium

**Environment / Component**: Settings Regression / Persistence

**Description & Plain Language Impact**: Language and theme settings can revert or mismatch after refresh. Users may experience inconsistent UI preferences.

**Steps to Reproduce**:
1. 1. Change settings.
2. 2. Reload page.
3. 3. Check values and UI.

**Expected Result**: Preferences should remain stable after reload.

**Actual Result**: Settings persistence is not fully consistent.

**Logs / Technical Evidence / Stack Trace**: src/lib/settings.ts

---

## Jira Issue 80: Billing and usage limit state can regress under auth transitions

**Jira Issue Title**: Billing and usage limit state can regress under auth transitions

**Issue Type**: Bug

**Severity & Priority**: High / Medium

**Environment / Component**: Billing Regression / Auth State

**Description & Plain Language Impact**: Billing state can drift when user auth changes. Users may see outdated pricing or usage status.

**Steps to Reproduce**:
1. 1. Trigger auth change.
2. 2. Reload Billing page.
3. 3. Observe plan state.

**Expected Result**: Billing state should always reflect the active account.

**Actual Result**: State can regress under auth transitions.

**Logs / Technical Evidence / Stack Trace**: src/pages/Billing.tsx

---

## Jira Issue 81: Content generation regression under partial external failure

**Jira Issue Title**: Content generation regression under partial external failure

**Issue Type**: Bug

**Severity & Priority**: High / High

**Environment / Component**: AI Generation Regression / External Failures

**Description & Plain Language Impact**: Generation fails or becomes partially broken when external services are degraded. Users may lose outputs or get unclear error states.

**Steps to Reproduce**:
1. 1. Trigger generation.
2. 2. Simulate partial external failure.
3. 3. Observe result.

**Expected Result**: The app should fail gracefully and preserve UX.

**Actual Result**: Generation flow is vulnerable to service instability.

**Logs / Technical Evidence / Stack Trace**: src/lib/analyzeText.ts; supabase/functions/generate-podcast/index.ts

---

## Jira Issue 82: Security and quality regression remains across updates

**Jira Issue Title**: Security and quality regression remains across updates

**Issue Type**: Bug

**Severity & Priority**: High / High

**Environment / Component**: Security Regression / Review Baseline

**Description & Plain Language Impact**: The security and quality baseline does not improve after updates. The risk profile remains elevated.

**Steps to Reproduce**:
1. 1. Review lint and build status.
2. 2. Cross-check with previous findings.
3. 3. Validate patch coverage.

**Expected Result**: The project should trend toward stronger security.

**Actual Result**: Regression review reveals continuing issues.

**Logs / Technical Evidence / Stack Trace**: package.json; eslint.config.js; src/**

---

## Jira Issue 83: Accessibility and keyboard flow regression continues to exist

**Jira Issue Title**: Accessibility and keyboard flow regression continues to exist

**Issue Type**: Bug

**Severity & Priority**: Medium / Medium

**Environment / Component**: Accessibility / Keyboard Navigation

**Description & Plain Language Impact**: Keyboard flows and focus management are not consistently validated. Users relying on keyboard navigation may struggle.

**Steps to Reproduce**:
1. 1. Navigate using keyboard only.
2. 2. Open dialogs.
3. 3. Check focus and verification.

**Expected Result**: Core flows should remain keyboard-accessible.

**Actual Result**: Accessibility regression remains unresolved.

**Logs / Technical Evidence / Stack Trace**: src/components/**

---

## Jira Issue 84: Stability regression under repeated navigation and reload cycles

**Jira Issue Title**: Stability regression under repeated navigation and reload cycles

**Issue Type**: Bug

**Severity & Priority**: High / Medium

**Environment / Component**: Navigation Stability / State Consistency

**Description & Plain Language Impact**: Repeated navigation and reloads can leave stale state across screens. Users may see mismatched or stale page data.

**Steps to Reproduce**:
1. 1. Navigate across pages repeatedly.
2. 2. Reload pages.
3. 3. Confirm state continuity.

**Expected Result**: The app should remain coherent and state-safe.

**Actual Result**: Stability under repeated navigation is weak.

**Logs / Technical Evidence / Stack Trace**: src/App.tsx; src/pages/**

---

## Jira Issue 85: Release readiness gate fails against current QA baseline

**Jira Issue Title**: Release readiness gate fails against current QA baseline

**Issue Type**: Bug

**Severity & Priority**: Critical / Critical

**Environment / Component**: Release Readiness / QA Gate

**Description & Plain Language Impact**: The current project fails the production-readiness threshold from both QA and Security view. The business risk is too high for a low-risk release.

**Steps to Reproduce**:
1. 1. Review build/lint/security findings.
2. 2. Compare with release criteria.
3. 3. Check exit gate.

**Expected Result**: The project should meet minimum acceptance thresholds.

**Actual Result**: Current QA baseline fails release criteria.

**Logs / Technical Evidence / Stack Trace**: npm run build; npm run lint; QA_System_Audit_Report/**

---
