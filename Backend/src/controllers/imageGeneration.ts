import { createAgent } from "langchain";
import { ChatOpenAI } from "@langchain/openai";
import { initChatModel } from "langchain";
import * as z from "zod";
import OpenAI from "openai";
import type { Request, Response } from "express";
import { io, isRegenereate, sessionID, userID, userPrompt } from "../server.js";
import { allUserMessages, getLastMessages, getMessageCount, getSession, getSummarizeMessages, storeMessages, storeSessionId, storeSummarizeMessages, storeUser } from "../db/model.js";
import crypto from "crypto";


const imageGeneration = async (req: Request, res: Response) => {
    const { socketId } = req.body;
    if (!socketId) return res.status(400).json({ error: "socketId required" })

    const prompt = userPrompt
    if (!prompt)
        return res.status(400).json({ error: "No prompt found for this socket" })

    console.log("starting stream for:", socketId, "Prompt:", prompt)

    if (userID) {
        await storeUser({ userId: userID })
    }

    // OLD MESSAGES
    const oldMessages = await getLastMessages({ sessionId: sessionID }) || []

    // invoke title agent
    const session = await getSession(sessionID)

    if ((!session || !session.title)) {
        // title model
        const title = await initChatModel("google-genai:gemini-2.5-flash-lite")
        const titleResult = await title.invoke([
            {
                role: "system",
                content: `Generate a short and concise chat title in 4-6 words based on the users message. Do NOT answer the question, just summarize it as a title. 
                        Example:
                        User message: Hello, what is the capital of America? 
                        Title: Capital of America 
                        User message: How do I reset my password on Gmail? 
                        Title: Gmail Password Reset`
            },
            {
                role: "user",
                content: prompt
            }
        ])
        const titleText = titleResult.content || ""

        await storeSessionId({ sessionId: sessionID, userId: userID, title: titleText as string })

    }

    //  user message
    let conversationId = ""
    if (!isRegenereate) {
        conversationId = crypto.randomUUID()
        await storeMessages({ userId: userID, sessionId: sessionID, role: 'user', content: prompt, messageId: conversationId })
    }

    // summarizer model
    const summarizer = await initChatModel("google-genai:gemini-2.5-flash-lite")

    // invoke summary agent     
    const messageCount = await getMessageCount({
        userId: userID,
        sessionId: sessionID
    })
    let summaryText = await getSummarizeMessages({
        userId: userID
    }) || ""


    if (messageCount % 10 == 0) {
        const summaryResult = await summarizer.invoke([
            {
                role: "system",
                content: `
                You are a memory extraction system for an AI assistant.

                Your job is NOT to summarize the conversation.
                Your job is to extract ONLY information that will remain useful in future conversations.

                Analyze ONLY user messages.

                Extract:

                1. Personal information:
                - name
                - location (only if explicitly provided)
                - occupation/student status
                - important life details

                2. Long-term interests:
                - hobbies
                - skills
                - technologies they are learning
                - favorite topics

                3. Goals:
                - career goals
                - learning goals
                - ongoing projects
                - future plans

                4. Preferences:
                - communication style
                - coding preferences
                - writing preferences
                - recurring choices

                5. Important context:
                - recurring problems
                - decisions already made
                - things the assistant should remember

                Rules:
                - Do NOT store temporary emotions or one-time requests.
                - Do NOT store greetings or casual conversation.
                - Do NOT store questions unless they reveal a preference or goal.
                - Remove duplicate information.
                - Keep only stable facts.
                - If there is nothing worth remembering, return exactly:
                ""

                Output format:

                Name:
                -

                Background:
                -

                Skills:
                -

                Projects:
                -

                Goals:
                -

                Preferences:
                -

                Important notes:
                -`,
            },
            {
                role: "user",
                content:
                    `Existing memory:
                    ${summaryText}

                    New conversation messages:
                    ${oldMessages.map(
                        m => `${m.role}: ${m.content}`
                    ).join("\n")}

                    Update the memory.
                    Keep previous useful information.
                    Remove outdated information`
            },
        ])

        summaryText = summaryResult.content as string;
        //save the summary to db
        await storeSummarizeMessages({ userId: userID, summarizeText: summaryText as string })
    }


    const systemPrompt = `
           You are an AI chatbot designed to behave like the user's caring best friend.

        You have two sources of context:
        1. recentMessages → the last 10 messages from the current conversation  
        2. longTermSummary → a compressed summary of all past user info extracted from earlier conversations

        Use longTermSummary ONLY to:
        - recall stable user preferences (skills, goals, projects, personality, writing style)
        - maintain long-term continuity naturally
        - avoid repeating things the user already told you earlier

        Use recentMessages ONLY to:
        - continue the current topic
        - understand the emotional flow
        - maintain short-term context

        STRICT RULES:
        - Never reveal, quote, or mention “longTermSummary”, “recentMessages”, “history”, “database”, “memory”, or how you know things.
        - Never say “based on previous chats” or “as you said earlier”.
        - Just respond naturally as if you casually remember things like a friend.

        ============================================
        ### PERSONALITY & TONE
        Warm, supportive, fun, best-friend energy.
        Use light reactions: “broo”, “wait what 😂”, “ohhh”, etc.
        Empathize first, then respond.
        Be honest but kind.
        Keep the flow natural and conversational.

        ============================================
        ### SAFETY RULES
        - No medical, legal, or financial advice.
        - Do not act as a therapist.
        - No dangerous instructions.

        ============================================
        ### CONTEXT PROVIDED TO YOU:
        longTermSummary: """${summaryText}"""

        recentMessages: (already provided before this)
        newUserMessage: """${prompt}"""

        Respond as a supportive best friend using all context naturally.

        `

    // TOOL
    const generateImage = {
        name: "generate_image_tool",
        description: "Generate an image from user prompt",
        schema: z.object({
            text: z.string(),
        }),
        async func({ text }: { text: string }) {
            const client = new OpenAI({ apiKey: process.env.API_KEY });

            const img = await client.images.generate({
                model: "dall-e-3",
                prompt: text,
                size: "1024x1024",
                n: 1,
            });

            // img object
            console.log(img)
            if (img.data && img.data[0] && img.data[0].url) {
                const imageUrl = img.data[0].url
                console.log("image URl:", imageUrl)
                //hasImageUrl = imageUrl
                return imageUrl
            }
            else {
                throw new Error("Image Generation Failed")
            }


        },
    }

    //  MODEL 
    const model = await initChatModel("google-genai:gemini-2.5-flash")

    //  AGENT 
    const agent = createAgent({
        model,
        systemPrompt: systemPrompt
    })


    // SIGNAL start
    res.json({ status: "streaming_started" })
    console.log("over here 248")
    // STREAMING
    const stream = await agent.stream(
        {
            messages: [
                ...oldMessages.map(m => ({
                    role: m.role === "ai" ? "assistant" : "user",
                    content: m.content,
                })),
                {
                    role: "user",
                    content: prompt
                }
            ]
        },
        { streamMode: "messages" }
    );

    const responseId = crypto.randomUUID()


    let aiMessage = ""
    for await (const [chunk] of stream) {
        const token = chunk?.contentBlocks?.[0]?.text;
        if (!token) continue;
        aiMessage += token
        io.to(socketId).emit("send_chunks", token);
    }
    console.log("over here 280")
    await storeMessages({ userId: userID, sessionId: sessionID, role: 'assistant', content: aiMessage, messageId: responseId })
    console.log("over here 282")
    //
    io.emit("send_messageId", responseId, conversationId)
    io.emit("send_sessionId", sessionID)


};

export default imageGeneration;

