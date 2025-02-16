import { GoogleGenerativeAI } from "@google/generative-ai";

export type TravelPreferences = {
  source: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: string;
  travelers: number;
  interests: string;
  includeTransportation?: boolean;
};

export type Airport = {
  name: string;
  id: string;
  time: string;
};

async function fetchFlights(source, destination, date) {
  try {
    const response = await fetch("http://localhost:5001/api/flights", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ source, destination, date }),
    });

    console.log("API Response Status:", response.status);
    const responseText = await response.text();
    console.log("Raw API Response:", responseText);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = JSON.parse(responseText);
    console.log("Parsed API Response:", data);

    // Check if 'best_flights' array is present and contains flights
    if (!data.best_flights || !Array.isArray(data.best_flights) || data.best_flights.length === 0) {
      throw new Error("No best flights found.");
    }

    console.log("Number of Best Flights:", data.best_flights.length);

    // Return top 5 best flights
    return data.best_flights.slice(0, 5);
  } catch (error) {
    console.error("Error fetching flights:", error);
    throw new Error("Failed to fetch real-time flight data.");
  }
}

export async function generateTravelPlan(preferences) {
  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `Act as a travel planning expert. Create a detailed travel itinerary based on the following preferences:
    - Traveling from: ${preferences.source}
    - Destination: ${preferences.destination}
    - Dates: ${preferences.startDate} to ${preferences.endDate}
    - Budget: ${preferences.budget}
    - Number of Travelers: ${preferences.travelers}
    - Interests: ${preferences.interests}
    ${preferences.includeTransportation ? "- Include transportation options." : ""}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let plan = response.text();

    if (preferences.includeTransportation) {
      plan += "\n\n## Available Flights\n\n";
      try {
        const flights = await fetchFlights(preferences.source, preferences.destination, preferences.startDate);

        // Check if flights data is available
        if (flights.length === 0) {
          console.log("No flights available for the selected route.");
          plan += "No flights available for your selected route.\n";
        } else {
          flights.forEach((flight, index) => {

          
            // Dynamically create markdown for each flight option
            plan += `---`;
            plan += `### Option ${index + 1}\n`;
            plan += `\n`;
            plan += `1. **Airline**: ${flight.airline}\n`;
            plan += `2. **Flight Number**: ${flight.flight_number}\n`;
            plan += `3. **Departure**: ${flight.departure.airport} (${flight.departure.time})\n`;
            plan += `4. **Arrival**: ${flight.arrival.airport} (${flight.arrival.time})\n`;
            plan += `5. **Duration**: ${Math.floor(flight.duration / 60)}h ${flight.duration % 60}m\n`;
            plan += `6. **Airplane**: ${flight.airplane}\n`;
            plan += `7. **Legroom**: ${flight.legroom}\n`;
            plan += `8. **Price**: $${flight.price}\n`;
            plan += `9. **Carbon Emissions**: ${(flight.carbon_emissions / 1000).toFixed(2)} kg CO2\n\n`;
            plan += `10. **Book link**: $${flight.booking_token}\n`;
            plan += `---`;
          });
        }
      } catch (error) {
        console.error("Error fetching flights:", error);
        plan += "Error fetching flight details. Please try again later.\n";
      }
    }

    console.log('PLAN', plan)

    return plan;
  } catch (error) {
    console.error("Error generating travel plan:", error);
    throw new Error("Failed to generate travel plan. Please try again.");
  }
}
