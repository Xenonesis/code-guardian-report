"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function FeedbackPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) {
      setError("Feedback message is required.");
      setSuccess(false);
      return;
    }

    setError("");
    setSuccess(true);

    setName("");
    setEmail("");
    setMessage("");

    setTimeout(() => {
      setSuccess(false);
    }, 3000);
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-20">
      <Card className="space-y-6 p-8 shadow-lg">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Share Your Feedback</h1>
          <p className="text-muted-foreground">
            We value your input. Help us improve Code Guardian.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            placeholder="Your Name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Input
            type="email"
            placeholder="Your Email (optional)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Textarea
            placeholder="Your Feedback (required)"
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button type="submit" className="w-full">
            Submit Feedback
          </Button>
        </form>

        {success && (
          <div className="text-center font-medium text-green-500">
            Thank you! Your feedback has been submitted successfully.
          </div>
        )}
      </Card>
    </div>
  );
}
