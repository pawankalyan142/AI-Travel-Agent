import ReactMarkdown from "react-markdown";
import { Chat } from "./Chat";

interface TravelItineraryProps {
  itinerary: string;
}

export function TravelItinerary({ itinerary }: TravelItineraryProps) {
  if (!itinerary) return null;

  // Split itinerary into main content and flights section
  const [mainContent] = itinerary.split("## Available Flights");

  // Extract the "Available Flights" section
  const flightsSectionMatch = itinerary.match(/## Available Flights([\s\S]*)/);
  const flightsSection = flightsSectionMatch ? flightsSectionMatch[1] : "";

  // Extract individual flight options using regex
  const flightData = flightsSection.match(/### Option \d+[\s\S]*?(?=### Option|\Z)/g) || [];

  return (
    <div className="mt-8 space-y-8">
      {/* Travel Itinerary Section */}
      <div className="p-6 bg-white rounded-lg shadow-lg animate-fade-in">
        <h2 className="text-2xl font-semibold mb-4 text-travel-primary">
          Your Travel Itinerary
        </h2>
        <div className="prose prose-sm md:prose-base lg:prose-lg max-w-none">
          <ReactMarkdown>{mainContent}</ReactMarkdown>
        </div>
      </div>

      {/* Available Flights Section */}
      <div className="p-6 bg-white rounded-lg shadow-lg animate-fade-in">
        <h2 className="text-2xl font-semibold mb-4 text-travel-primary">
          Google realtime Available Flights list
        </h2>
        <div className="prose prose-sm md:prose-base lg:prose-lg max-w-none">
          {flightData.length > 0 ? (
            flightData.map((flight, index) => (
              <ReactMarkdown key={index}>{flight}</ReactMarkdown>
            ))
          ) : (
            <p>No available flights found.</p>
          )}
        </div>
      </div>

      {/* Chat Component */}
      <Chat itinerary={itinerary} />
    </div>
  );
}
