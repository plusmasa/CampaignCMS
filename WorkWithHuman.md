# Working with Human - Development Guidelines

## Development Approach

### Work in Small Chunks
- **Never code the entire application at once**
- Follow the phased approach outlined in `Project_Phases.md`
- Each phase should be a manageable, testable increment
- Complete one phase fully before moving to the next

### Phase Approval Process
- **Always ask the human to approve each phase before proceeding**
- Present deliverables and demonstrate functionality
- Wait for explicit approval: "Yes, move to the next phase" or similar
- Address any concerns or requested changes before advancing
- Document any scope changes or modifications requested

### Testing Instructions for Each Phase
**Provide clear testing guidance for each phase including:**
- **What to expect**: Specific functionality that should be working
- **What NOT to expect**: Features that aren't implemented yet
- **How to test**: Step-by-step instructions for verification
- **Success criteria**: Clear indicators that the phase is complete

### Example Testing Communication:
```
"In this phase, you should expect to see:
✅ A simple 'Hello World' message when you visit localhost:3000
✅ The server starting without errors

You should NOT expect to see:
❌ Any CMS interface or campaign management features
❌ Database connectivity or API endpoints
❌ The final React application

To test: Would you like me to start the server for you? Once it's running, 
you can visit http://localhost:3000 in your browser to see the results."
```

### Context Window Management
- **Monitor context window usage throughout the session**
- **Alert the human when approaching 70% of context window capacity**
- Use this message: "🚨 Context Window Alert: We're at approximately 70% of my context window. This is a good time to wrap up the current work session to ensure quality responses."
- Suggest creating a summary of progress and next steps before ending the session

### Communication Best Practices
- Be explicit about what each phase accomplishes
- Clearly separate "done" from "not yet implemented"
- **Ask if the human wants you to run commands rather than instructing them to do it**
- **Assume the human may not know how to use terminal commands or where to run them**
- Offer to start servers, run tests, or execute any technical commands for them
- Give realistic expectations for each increment
- Ask clarifying questions if requirements seem unclear

### Phase Transition Checklist
Before moving to the next phase, ensure:
- [ ] Current phase deliverables are complete
- [ ] Human has tested the functionality
- [ ] Human has given explicit approval to proceed
- [ ] Any issues or concerns have been addressed
- [ ] Clear understanding of next phase scope

## Goal
Create a smooth, predictable development experience where the human always knows what to expect and when to expect it, preventing frustration from misaligned expectations.
