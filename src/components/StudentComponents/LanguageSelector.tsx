
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface LanguageOption {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface LanguageSelectorProps {
  onSelectLanguage: (language: string) => void;
}

const LanguageSelector = ({ onSelectLanguage }: LanguageSelectorProps) => {
  const { toast } = useToast();
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);

  const languages: LanguageOption[] = [
    { id: 'javascript', name: 'JavaScript', icon: 'JS', color: 'bg-yellow-400' },
    { id: 'python', name: 'Python', icon: 'PY', color: 'bg-blue-500' },
    { id: 'java', name: 'Java', icon: 'JV', color: 'bg-red-500' },
    { id: 'csharp', name: 'C#', icon: 'C#', color: 'bg-purple-600' },
  ];

  const handleSelection = (language: string) => {
    setSelectedLanguage(language);
  };

  const handleConfirm = () => {
    if (selectedLanguage) {
      toast({
        title: "Language selected",
        description: `You've selected ${selectedLanguage}. Good luck with your quiz!`,
      });
      onSelectLanguage(selectedLanguage);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto animate-fade-in">
      <h2 className="text-2xl font-bold mb-6 text-center">Select Your Programming Language</h2>
      <p className="text-gray-600 mb-8 text-center">
        Choose the language you want to be tested on. The quiz will be tailored to your selection.
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {languages.map((lang) => (
          <Card 
            key={lang.id}
            className={`cursor-pointer transition-all hover:shadow-md ${selectedLanguage === lang.id ? 'ring-2 ring-primary' : ''}`}
            onClick={() => handleSelection(lang.id)}
          >
            <CardHeader className="p-4 text-center">
              <div className={`w-12 h-12 rounded-full ${lang.color} text-white flex items-center justify-center mx-auto text-lg font-bold`}>
                {lang.icon}
              </div>
            </CardHeader>
            <CardContent className="text-center p-4 pt-0">
              <h3 className="font-semibold">{lang.name}</h3>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-8 flex justify-center">
        <Button 
          onClick={handleConfirm} 
          disabled={!selectedLanguage} 
          size="lg"
          className="px-8"
        >
          Start Quiz
        </Button>
      </div>
    </div>
  );
};

export default LanguageSelector;
