import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { TravelPreferences, generateTravelPlan } from "@/lib/gemini";
import { useToast } from "@/components/ui/use-toast";

interface TravelFormProps {
  // onSubmit: (preferences: TravelPreferences) => void;
  // isLoading: boolean;
  setItinerary: React.Dispatch<React.SetStateAction<string>>
}

export function TravelForm({ setItinerary }: TravelFormProps) {
  const [preferences, setPreferences] = useState<TravelPreferences>({
    source: "HYD",
    destination: "VTZ",
    startDate: "",
    endDate: "",
    budget: "5000",
    travelers: 1,
    interests: "BEACHES",
    includeTransportation: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const plan = await generateTravelPlan(preferences);
      setItinerary(plan);
      toast({
        title: "Success!",
        description: "Your travel plan has been generated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate travel plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="source">Source Location</Label>
          <Input
            id="source"
            required
            value={preferences.source}
            onChange={(e) =>
              setPreferences({ ...preferences, source: e.target.value })
            }
            placeholder="e.g., New York"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="destination">Destination</Label>
          <Input
            id="destination"
            required
            value={preferences.destination}
            onChange={(e) =>
              setPreferences({ ...preferences, destination: e.target.value })
            }
            placeholder="e.g., Paris"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date</Label>
          <Input
            id="startDate"
            type="date"
            required
            value={preferences.startDate}
            onChange={(e) =>
              setPreferences({ ...preferences, startDate: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">End Date</Label>
          <Input
            id="endDate"
            type="date"
            required
            value={preferences.endDate}
            onChange={(e) =>
              setPreferences({ ...preferences, endDate: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="budget">Budget</Label>
          <Input
            id="budget"
            required
            value={preferences.budget}
            onChange={(e) =>
              setPreferences({ ...preferences, budget: e.target.value })
            }
            placeholder="e.g., $5000"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="travelers">Number of Travelers</Label>
          <Input
            id="travelers"
            type="number"
            min="1"
            required
            value={preferences.travelers}
            onChange={(e) =>
              setPreferences({
                ...preferences,
                travelers: parseInt(e.target.value),
              })
            }
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="interests">Interests & Preferences</Label>
        <Textarea
          id="interests"
          required
          value={preferences.interests}
          onChange={(e) =>
            setPreferences({ ...preferences, interests: e.target.value })
          }
          placeholder="e.g., historical sites, local cuisine, outdoor activities"
          className="h-24"
        />
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="includeTransportation"
          checked={preferences.includeTransportation}
          onCheckedChange={(checked) =>
            setPreferences({
              ...preferences,
              includeTransportation: checked as boolean,
            })
          }
        />
        <Label
          htmlFor="includeTransportation"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Include transportation details
        </Label>
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Generating Plan..." : "Plan My Trip"}
      </Button>
    </form>
  );
}