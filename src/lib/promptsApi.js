import { memoriesApi as clientMemoriesApi, promptsApi as clientPromptsApi } from '@/api/base44Client';

// Map backend field names to frontend expectations
// Backend returns { text } for memories, frontend expects { content }
function mapMemory(mem) {
  return {
    ...mem,
    content: mem.text || mem.content,
  };
}

function mapPrompt(prompt) {
  return {
    ...prompt,
    created_date: prompt.created_date || prompt.createdAt,
  };
}

export const promptsApi = {
  async generate(promptText, workspaceId = null) {
    // Server handles memory injection automatically via /prompts/generate
    const result = await clientPromptsApi.generate(promptText, workspaceId);
    return result.improvedPrompt || result;
  },

  async save(title, originalInput, improvedOutput) {
    const result = await clientPromptsApi.save(
      title || originalInput.substring(0, 80),
      originalInput,
      improvedOutput
    );
    return result;
  },

  async list() {
    const data = await clientPromptsApi.getAll();
    const prompts = Array.isArray(data) ? data : (data.prompts || []);
    return prompts.map(mapPrompt);
  },

  async deletePrompt(id) {
    return await clientPromptsApi.delete(id);
  },
};

export const memoriesApi = {
  async create(content, enabled = true, scope = 'global', workspaceId = null) {
    const result = await clientMemoriesApi.create(content, enabled, scope, workspaceId);
    return mapMemory(result);
  },

  async list() {
    const data = await clientMemoriesApi.getAll();
    const memories = Array.isArray(data) ? data : (data.memories || []);
    return memories.map(mapMemory);
  },

  async update(id, data) {
    // Map frontend field names to backend field names
    const updates = { ...data };
    if (updates.content) {
      updates.text = updates.content;
      delete updates.content;
    }
    const result = await clientMemoriesApi.update(id, updates);
    return mapMemory(result);
  },

  async deleteMemory(id) {
    return await clientMemoriesApi.delete(id);
  },
};