import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Loader2 } from "lucide-react";
import { useDispatch } from "react-redux";
import { useState } from "react";
import { setAiSearch } from "@/lib/features/searchSlice";
import { useAiSearchMutation } from "@/lib/api";
import { toast } from "sonner";

export default function AISearch() {
  const dispatch = useDispatch();
  const [value, setValue] = useState("");
  const [aiSearch, { isLoading }] = useAiSearchMutation();

  const handleSearch = async () => {
    if (!value.trim()) {
      toast.error("Please enter a search query");
      return;
    }

    try {
      const result = await aiSearch(value.trim()).unwrap();
      dispatch(setAiSearch({
        query: value.trim(),
        response: result.response,
        hotels: result.hotels
      }));
      toast.success("AI search completed!");
    } catch (error) {
      console.error('AI Search Error:', error);
      toast.error("AI search failed. Please try again.");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="z-10 w-full max-w-lg">
      <div className="relative flex items-center">
        <div className="relative flex-grow">
          <Input
            placeholder="Describe your ideal hotel experience..."
            name="query"
            value={value}
            className="bg-[#1a1a1a] text-sm sm:text-base text-white placeholder:text-white/70 placeholder:text-sm sm:placeholder:text-base border-0 rounded-full py-6 pl-4 pr-12 sm:pr-32 w-full transition-all"
            onChange={(e) => setValue(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
          />
        </div>

        <Button
          type="button"
          className="absolute right-2 h-[80%] my-auto bg-black text-white rounded-full px-2 sm:px-4 flex items-center gap-x-2 border-white border-2 hover:bg-black/80 transition-colors disabled:opacity-50"
          onClick={handleSearch}
          disabled={isLoading || !value.trim()}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4 fill-white" />
          )}
          <span className="text-sm">{isLoading ? "Searching..." : "AI Search"}</span>
        </Button>
      </div>
    </div>
  );
}
