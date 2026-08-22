# TeachX Founder Manual QA

This guide is for testing TeachX like a real teacher. You do not need to inspect code or use developer tools.

## Test dashboard

- [ ] Public website
- [ ] Signup
- [ ] First login
- [ ] Home
- [ ] Save Time
- [ ] Teaching
- [ ] TARA
- [ ] Earn More
- [ ] Learn More
- [ ] Enjoy More
- [ ] Planner
- [ ] Resources
- [ ] Community
- [ ] Business
- [ ] Notifications
- [ ] Help
- [ ] Settings
- [ ] Subscription
- [ ] Logout/login
- [ ] Real mobile test

## Before you start

Prepare:

- One desktop or laptop.
- One real phone.
- A mobile number that has never been used on TeachX.
- Access to that phone's text messages.
- One harmless sample file for upload, such as a worksheet PDF.
- A notebook or document for recording bugs.
- A second test teacher account in a different workspace for privacy tests.

Use this sample teaching information consistently:

- Teacher: Founder Test Teacher
- Class: Class 7A
- Subject: Science
- Student: Ananya Test
- Lesson: Photosynthesis Basics
- Resource: Photosynthesis Worksheet
- Task: Prepare Class 7A activity

Never use real student personal information during testing.

For every important page, answer these six questions:

1. Did it open?
2. Did I understand what it is?
3. Did the main button work?
4. Did the result actually save?
5. Could I find the result again after leaving the page?
6. Did TeachX clearly tell me whether it worked or failed?

## A. Public website

Test once on desktop, then at 360px, 390px, 414px, and 768px or on equivalent real devices.

1. Open the public TeachX website while logged out.
2. Confirm the TeachX logo is clear and not stretched.
3. Open every top navigation link: Explore, TARA, Pricing, and Sign In.
4. Return Home and read the first screen. Confirm it quickly says TeachX is for teachers.
5. Confirm the hero image is clear and the text is readable.
6. Select **Start Free**. Confirm it opens the existing teacher signup page. Go back.
7. Select **Explore TeachX**. Confirm it moves to the correct product section.
8. Check Save Time, Earn More, Learn More, and Enjoy More. Confirm all four are visually distinct and understandable.
9. Check the TARA section. Confirm it describes real assistance without pretending to perform an action.
10. Open Pricing. Confirm the seven-day trial, Basic INR 199/month, Pro INR 499/month, and applicable-tax message.
11. Confirm no annual discount is promised.
12. Open the mobile menu and use every item. Confirm the menu closes and nothing is hidden.
13. Scroll to the footer and open Privacy, Terms, Security/Trust, Support/Contact, Cookies, and Refund Policy.
14. Confirm the page has no sideways scrolling, clipped text, blank images, or overlapping buttons.

Pass when every link works, all claims are honest, and the page is usable at every listed width.

## B. Signup

1. From the public website, select **Start Free**.
2. Enter the test teacher's name, country, and unused mobile number.
3. Enter the requested PIN twice and accept the policies.
4. Request and enter the real text-message code when prompted.
5. Confirm invalid or expired codes show a clear message and do not create an account.
6. Complete signup once. Do not click the final button repeatedly.
7. Confirm TeachX enters the teacher experience without asking for a long professional profile.
8. Try the same mobile number again in a separate private window. Confirm a duplicate account is not created.
9. Confirm no database, tenant, API, environment, or other technical wording is shown.

Pass when one account and one workspace are created and duplicate signup is safely rejected.

## C. First login

1. Confirm the welcome screen appears after signup.
2. Confirm Save Time, Earn More, Learn More, Enjoy More, and TARA are offered as first choices.
3. Open the teacher account area and confirm the personal TeachX workspace is shown.
4. Open Subscription and confirm **Trial active**, the correct days remaining, and the correct trial end date.
5. Open AI Studio and TARA. Confirm both show the same real AI-credit balance.
6. Confirm an account without an added email says **Email not added**, not an internal placeholder address.

Pass when the new teacher has a safe personal workspace, one trial, and one consistent credit balance.

## D. Teacher Home

1. Open Home.
2. Confirm the greeting and current context make sense.
3. Confirm all four pillars are immediately visible and understandable.
4. Open each pillar and return using normal navigation.
5. Open TARA from Home.
6. Use each visible quick action once.
7. Confirm empty areas explain the next useful action instead of showing a broken blank space.

## E. Save Time

Use the following check for every available creation tool: open it, enter a real request, generate or create, save, leave, reopen, edit when offered, and archive/delete when offered.

Test:

- Lesson generator: create **Photosynthesis Basics** for Class 7A Science.
- Worksheet: create **Photosynthesis Worksheet**.
- Quiz: create five photosynthesis questions.
- Question paper: create a short Class 7 Science paper.
- Assessment: create a basic understanding check.
- Rubric: create a rubric for a science model.
- Report comments: create a constructive student comment.
- Parent communication: draft a polite progress message.
- Presentation: create a short photosynthesis presentation.
- Certificate: create only if the current tool supports real saving/export.
- Classroom activity: create a leaf-observation activity.
- Homework: create one Class 7 homework task.
- AI Chat: ask a follow-up question and confirm the conversation remains available in History.
- Saved AI: save one result and find it again.
- Search: search for **Photosynthesis** and open an authorized result.

Do not mark a tool as passed merely because its page opens. Pass only when the result is created, saved, found again, and routed to the correct existing workflow.

## F. Teaching

1. Open Teaching and select **Create your first class**.
2. Create Class 7A, Science, section Main, with a reasonable capacity.
3. Confirm the success message and open the class.
4. Add Ananya Test without an email. Add a second test student with a safe test email if desired.
5. Confirm both appear in the roster.
6. Edit the invited student's name, leave the page, return, and confirm it persisted.
7. Remove and re-add one student. Confirm only that class enrollment changes.
8. Create or attach the Photosynthesis Basics lesson.
9. Create and publish an assignment. Confirm roster students receive assignment records.
10. Save attendance and reopen the class to confirm it persisted.
11. Review a submitted assignment only when a safe test submission exists.
12. Add or attach Photosynthesis Worksheet in Study Materials.
13. Schedule related work in Planner.
14. Open the resulting notification and confirm it returns to the right class or work item.
15. Confirm the same class, student count, lesson, resource, and schedule appear consistently across Teaching, Planner, Resources, Home, and TARA.

Privacy check: while signed in as Teacher A, try a copied Teacher B class link. It must show no Teacher B data.

## G. TARA

Start a new TARA conversation and type these prompts one at a time:

1. `Help me create a lesson for my class.`
2. `What classes do I have?`
3. `What do I need to do today?`
4. `Create a worksheet.`
5. `Help me plan tomorrow.`
6. `Show me my recent resources.`
7. `Help me write a message to parents.`
8. `How many AI credits do I have?`
9. `Take me to my planner.`

For each response, confirm TARA understands the request, uses only real teacher context, gives useful next actions, and navigates to the correct existing TeachX page. TARA must not invent classes, students, lessons, earnings, orders, subscriptions, courses, or offers.

Continue one earlier conversation and confirm the follow-up makes sense. Set or use a zero-credit test account when available and confirm generation is blocked clearly. From Teacher A, ask about Teacher B's private class; TARA must not reveal it.

## H. Earn More

1. Open Earn More and start the 1:1 teaching profile.
2. Add a safe test photo using the real upload flow.
3. Add qualifications, experience, expertise, teaching levels, languages, teaching formats, and availability.
4. Set an hourly, weekly, monthly, or custom price only where offered. Confirm the selected currency is correct.
5. Save as draft, leave, return, and confirm every field persisted.
6. Edit one field and preview the public profile.
7. Confirm private information is not visible in the public preview.
8. Activate only if the current workflow allows it and clearly explains the result.
9. Open Happy Notes when exposed, choose a constructive category, save/submit test content, and confirm TeachX reports only its own submission state.
10. Do not expect an external publication outcome unless a real integration confirms it.

## I. Learn More

1. Open Learn More.
2. Open AI Skills, Professional Development, Audiobooks, Books, Video Courses, and Webinars.
3. Open one real free item if available.
4. Select one real premium item if available and confirm access follows the current subscription.
5. Confirm empty categories say no content is available or coming soon.
6. Confirm no invented books, teachers, courses, webinars, or access claims appear.

## J. Enjoy More

1. Open Enjoy More.
2. Confirm it clearly says Coming Soon.
3. Check Travel, Family, Wellness, Leisure, Teacher Experiences, and Special Offers.
4. Confirm there are no fake offers, partners, prices, events, booking forms, or payment buttons.

## K. Community

Use only safe test content.

1. Open Feed and create a short professional post.
2. Start a discussion, leave, search for it, and reopen it.
3. From the second authorized test teacher, reply, react, and bookmark where supported.
4. Join and leave a test group where supported.
5. Open a professional teacher profile and test follow/connect.
6. Start a message and confirm unread/read state.
7. Attach only a safe resource where attachments are supported.
8. Confirm mentions, replies, messages, and group activity create the correct notifications.
9. Confirm private messages/groups cannot be opened by an unrelated teacher or changed URL.

If an action is visibly unavailable, record **Not available in current beta** rather than marking it failed.

## L. Planner

1. Open Today, Agenda, Day, Week, and Month.
2. Confirm today's date and nearby dates are correct for the workspace time zone.
3. Create **Prepare Class 7A activity** with a due date and priority.
4. Edit its title or date and confirm it moves correctly.
5. Complete it, reopen it, then delete/archive it where supported.
6. Schedule Photosynthesis Basics and connect it to Class 7A.
7. Open the calendar item and follow its links back to the class and lesson.
8. Confirm assignment deadlines and related teaching work appear once, not as duplicate records.

## M. Resources

1. Create Photosynthesis Worksheet manually or from AI Studio.
2. Save it as a draft and reopen it.
3. Edit the title or description and confirm the change persists.
4. Search for **Photosynthesis**.
5. Test type/status filters and each sort option.
6. Duplicate the resource and confirm exactly one copy is created.
7. Publish only when eligible and confirm its real status.
8. Download/open the actual file when one exists. Confirm the file is correct.
9. Archive it, find it in Archived, restore if supported, then delete a disposable copy.
10. Confirm another tenant cannot open a private resource by changing its link.

## N. Business

1. Open Business Profile and Portfolio. Confirm they use the same professional identity as Earn More.
2. Open Publishing and confirm real Draft, Published, Pending, and Archived states only.
3. Open Marketplace products and manage only a real eligible test resource.
4. Open Orders, Reviews, Earnings, Wallet, Analytics, and Downloads.
5. With no real transaction, confirm honest empty states and zero values sourced from real records.
6. With an authorized test order, confirm order, revenue, wallet, and download states connect once.
7. Confirm no fake buyer, sale, review, earnings, wallet balance, conversion, or payout appears.

## O. Notifications

1. Trigger a safe notification through an assignment, planner reminder, message, mention, or support update.
2. Open Notifications and find it.
3. Mark it read, then unread if supported.
4. Open it and confirm the destination is the exact related item.
5. Return and use Mark All Read where supported.
6. Change one notification preference and confirm it saves.
7. Confirm Teacher A cannot open Teacher B's notification link or data.

## P. Help & Support

1. Open Help and search for **create a class**.
2. Open one relevant article and use its back navigation.
3. Create a support request with a harmless test subject and description.
4. Confirm loading, success, and the submitted request in history.
5. Open it and check its status.
6. Reply where supported.
7. Test a failed submission only in a safe staging setup, then use Retry.
8. Submit feedback and confirm its success message.

## Q. Settings

1. Open Profile and Account. Confirm name, phone, workspace, and status are correct.
2. Confirm a mobile-only account does not expose its internal placeholder email.
3. Change one teaching preference and confirm it saves.
4. Change one AI preference and notification preference.
5. Test Appearance and a supported Language option. Confirm the interface only claims languages actually available.
6. Review Privacy and professional/community visibility controls.
7. Review Security and active-session information where available.
8. Leave Settings, return, and confirm every supported change persisted.

## R. Subscription

1. Open Subscription from Settings and Business.
2. Confirm both show the same current plan, trial status, end date, AI entitlement, and usage.
3. Confirm Basic is INR 199/month plus applicable taxes and Pro is INR 499/month plus applicable taxes.
4. Confirm no annual savings are shown without a real annual plan.
5. Start checkout only in an approved payment test environment.
6. Cancel checkout. Confirm no paid access is granted.
7. Use a failed test payment. Confirm no paid access is granted.
8. Use one successful signed provider test payment. Wait for backend confirmation before checking access.
9. Replay the same test webhook through the provider tools. Confirm only one subscription is active.
10. Confirm expired/cancelled states clearly explain retained data and restricted features.

Never perform real-money tests until payment, tax, refund, and reconciliation readiness are approved.

## S. Logout / login again

1. Log out from Settings or the account menu.
2. Try opening a copied protected TeachX link. Confirm it returns to Sign In without showing private data.
3. Log in again using the same mobile number and PIN.
4. Confirm the same personal workspace opens.
5. Recheck Class 7A, Ananya Test, Photosynthesis Basics, the worksheet, Planner task, TARA history, profile, preferences, trial, and credits.
6. Confirm no duplicate workspace, class, trial, or resource was created by logging in again.

## Real phone sequence

On a real phone, complete this exact sequence without switching to a desktop:

1. Landing -> mobile menu -> Pricing -> Start Free.
2. Signup -> text-message authentication -> first login.
3. Home -> all four pillars -> TARA.
4. Save Time -> AI Studio -> create and save one worksheet.
5. Teaching -> create Class 7A -> open class -> add Ananya Test.
6. Create/open a lesson -> create assignment -> save attendance.
7. Resources -> find the worksheet -> open it.
8. Planner -> create and complete a task.
9. Community -> open Feed, Discussion, and Messages.
10. Earn More -> open/edit profile -> preview.
11. Learn More -> inspect available and empty content.
12. Enjoy More -> confirm Coming Soon.
13. Notifications -> open one deep link.
14. Help -> search -> Support -> submit a safe request.
15. Settings -> change one supported preference.
16. Subscription -> confirm trial, plan, and credits.
17. Logout -> log in again -> confirm saved data.

Throughout the phone test check:

- Every button is easy to tap.
- Every page scrolls to the final item.
- The keyboard does not cover the active field or submit button.
- Back navigation returns to the expected page.
- Forms, dialogs, and uploads fit the screen.
- Long names and lists do not overlap or force sideways scrolling.
- Loading, empty, success, and failure states are understandable.

## Bug reporting

Create one report per problem:

```text
SCREEN:

WHAT I DID:

WHAT I EXPECTED:

WHAT ACTUALLY HAPPENED:

SCREENSHOT:

SEVERITY: GREEN / YELLOW / ORANGE / RED
```

Severity meaning:

- **GREEN**: Cosmetic issue. The work can continue.
- **YELLOW**: Inconvenient or confusing, but a workaround exists.
- **ORANGE**: Important workflow is broken or unreliable.
- **RED**: Cannot use the product, security/privacy failure, payment error, or data loss/cross-teacher data problem.

Stop testing and report immediately for any RED issue. Do not retry a payment or delete data repeatedly.

## Completion rule

Founder manual QA is complete only when every dashboard item has a result: **PASS**, **BUG**, **NOT AVAILABLE IN CURRENT BETA**, or **BLOCKED BY PRODUCTION CONFIGURATION**. Blank items are not a pass.
