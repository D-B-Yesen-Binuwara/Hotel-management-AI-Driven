import { Request, Response, NextFunction } from "express";
import { OpenAI } from "openai";
import Hotel from "../infrastructure/entities/Hotel";
import { generateEmbedding } from "./utils/embeddings";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const respondToAIQuery = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { query } = req.body;

    if (!query || query.trim() === "") {
      return res.status(400).json({ error: "Query is required" });
    }

    // Use vector search to find relevant hotels
    const queryEmbedding = await generateEmbedding(query);
    const relevantHotels = await Hotel.aggregate([
      {
        $vectorSearch: {
          index: "hotel_vector_index",
          path: "embedding",
          queryVector: queryEmbedding,
          numCandidates: 25,
          limit: 8,
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          location: 1,
          price: 1,
          image: 1,
          rating: 1,
          description: 1,
          score: { $meta: "vectorSearchScore" },
        },
      },
    ]);

    // Create AI prompt with relevant hotels
    const hotelContext = relevantHotels.map(hotel => 
      `${hotel.name} in ${hotel.location} - $${hotel.price}/night, Rating: ${hotel.rating || 'N/A'}, Description: ${hotel.description}`
    ).join('\n');

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a helpful hotel recommendation assistant. Based on the user's query, recommend the most suitable hotels from the available options. Provide a brief, friendly response with specific hotel recommendations and why they match the user's needs. Keep it concise and helpful.\n\nAvailable hotels:\n${hotelContext}`
        },
        {
          role: "user",
          content: query
        }
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    const aiResponse = response.choices[0]?.message?.content || "I couldn't find suitable recommendations for your query.";

    res.status(200).json({
      response: aiResponse,
      hotels: relevantHotels
    });
  } catch (error) {
    console.error('AI Query Error:', error);
    next(error);
  }
};
