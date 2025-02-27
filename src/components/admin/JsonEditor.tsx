"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

// Monaco Editor'ü client-side only olarak import ediyoruz
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

interface JsonEditorProps {
  value: any;
  onChange: (newContent: any) => void;
}

const JsonEditor: React.FC<JsonEditorProps> = ({ value, onChange }) => {
  const [jsonValue, setJsonValue] = useState<string>("");

  useEffect(() => {
    try {
      // Eğer value bir string değilse, JSON.stringify ile stringe çeviriyoruz
      const stringValue = typeof value === 'string' 
        ? value 
        : JSON.stringify(value, null, 2);
      setJsonValue(stringValue);
    } catch (error) {
      console.error("JSON parse error:", error);
      setJsonValue("{}");
    }
  }, [value]);

  const handleEditorChange = (value: string | undefined) => {
    if (!value) return;
    
    setJsonValue(value);
    
    try {
      // Editör içeriğini JSON objesine çeviriyoruz
      const parsedJson = JSON.parse(value);
      onChange(parsedJson);
    } catch (error) {
      // JSON parse hatası olursa, sadece konsola yazdırıyoruz
      // Kullanıcı düzenlemeyi tamamlayana kadar onChange'i çağırmıyoruz
      console.error("JSON parse error:", error);
    }
  };

  return (
    <div className="w-full h-[400px] border rounded-md overflow-hidden">
      <MonacoEditor
        height="400px"
        language="json"
        value={jsonValue}
        onChange={handleEditorChange}
        options={{
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          formatOnPaste: true,
          formatOnType: true,
          tabSize: 2,
          wordWrap: "on",
          theme: typeof window !== "undefined" && document.documentElement.classList.contains("dark") ? "vs-dark" : "vs-light"
        }}
      />
    </div>
  );
};

export default JsonEditor; 