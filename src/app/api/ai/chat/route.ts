import { NextRequest } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export const runtime = 'edge';
export const maxDuration = 60;

const DEFAULT_SYSTEM_PROMPT =
  '你是 NoteVault 的 AI 写作助手，帮助用户进行写作、编辑、总结和翻译。请用中文回答。回答要简洁、专业、有帮助。';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, model, systemPrompt } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: '请提供有效的消息列表' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const systemMessage = {
      role: 'system' as const,
      content: systemPrompt || DEFAULT_SYSTEM_PROMPT,
    };

    const allMessages = [systemMessage, ...messages];

    const zai = await ZAI.create();

    // Try streaming first
    try {
      const stream = await zai.chat.completions.create({
        messages: allMessages,
        stream: true,
        model: model || 'gpt-4o-mini',
      });

      if (stream && typeof stream === 'object' && Symbol.asyncIterator in stream) {
        // Streaming response
        const encoder = new TextEncoder();
        const readable = new ReadableStream({
          async start(controller) {
            try {
              for await (const chunk of stream as AsyncIterable<any>) {
                const content = chunk.choices?.[0]?.delta?.content;
                if (content) {
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
                  );
                }
              }
              controller.enqueue(encoder.encode('data: [DONE]\n\n'));
              controller.close();
            } catch (err) {
              controller.error(err);
            }
          },
        });

        return new Response(readable, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
          },
        });
      }
    } catch {
      // Fall through to non-streaming
    }

    // Non-streaming fallback
    const completion = await zai.chat.completions.create({
      messages: allMessages,
      model: model || 'gpt-4o-mini',
    });

    const content =
      (completion as any).choices?.[0]?.message?.content || '抱歉，我无法生成回复。';

    return new Response(
      JSON.stringify({
        content,
        model: model || 'gpt-4o-mini',
        tokensUsed: (completion as any).usage?.total_tokens,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('[AI Chat API Error]', error);

    const message =
      error?.message || error?.toString?.() || 'AI 服务暂时不可用，请稍后再试。';

    return new Response(
      JSON.stringify({
        error: message,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
