/**
 * Webhook Management Component
 * UI for managing repository webhooks and monitoring rules
 */

import React, { useState, useEffect } from "react";
import {
  WebhookManager,
  WebhookConfig,
  WebhookEvent,
} from "@/services/monitoring/WebhookManager";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
// Tabs components reserved for future use
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Webhook,
  Plus,
  Trash2,
  Settings,
  Activity,
  Bell,
  Shield,
  Code,
} from "lucide-react";
import { cn } from "@/lib/utils";

import { logger } from "@/utils/logger";
const WebhookManagement: React.FC = () => {
  const { user } = useAuth();
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [_selectedWebhook, setSelectedWebhook] = useState<WebhookConfig | null>(
    null
  );
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [_isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadWebhooks();
    }
  }, [user]);

  const loadWebhooks = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const data = await WebhookManager.getWebhooks(user.uid);
      setWebhooks(data);
    } catch (error) {
      logger.error("Failed to load webhooks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateWebhook = async (data: {
    provider: "github" | "gitlab";
    repositoryName: string;
    repositoryUrl: string;
    events: WebhookEvent[];
  }) => {
    if (!user) return;

    try {
      await WebhookManager.createWebhook({
        userId: user.uid,
        provider: data.provider,
        repositoryId: data.repositoryName.toLowerCase().replace(/\s+/g, "-"),
        repositoryName: data.repositoryName,
        repositoryUrl: data.repositoryUrl,
        events: data.events,
        active: true,
      });

      await loadWebhooks();
      setIsCreateDialogOpen(false);
    } catch (error) {
      logger.error("Failed to create webhook:", error);
    }
  };

  const handleToggleWebhook = async (webhookId: string, active: boolean) => {
    try {
      await WebhookManager.updateWebhook(webhookId, { active });
      await loadWebhooks();
    } catch (error) {
      logger.error("Failed to toggle webhook:", error);
    }
  };

  const handleDeleteWebhook = async (webhookId: string) => {
    if (!confirm("Are you sure you want to delete this webhook?")) return;

    try {
      await WebhookManager.deleteWebhook(webhookId);
      await loadWebhooks();
    } catch (error) {
      logger.error("Failed to delete webhook:", error);
    }
  };

  if (!user) {
    return (
      <div className="py-12 text-center">
        <Bell className="mx-auto mb-4 h-12 w-12 opacity-20" />
        <p className="text-muted-foreground">
          Please sign in to manage webhooks
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-3 text-3xl font-bold">
            <Webhook className="text-primary h-8 w-8" />
            Repository Monitoring
          </h2>
          <p className="text-muted-foreground mt-2">
            Continuous security scanning with real-time alerts
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Webhook
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <CreateWebhookDialog
              onSubmit={handleCreateWebhook}
              onClose={() => setIsCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Webhook className="mx-auto mb-2 h-8 w-8 text-blue-600" />
              <div className="text-3xl font-bold">{webhooks.length}</div>
              <div className="text-muted-foreground text-sm">
                Active Webhooks
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Activity className="mx-auto mb-2 h-8 w-8 text-green-600" />
              <div className="text-3xl font-bold">
                {webhooks.filter((w) => w.active).length}
              </div>
              <div className="text-muted-foreground text-sm">Monitoring</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Shield className="mx-auto mb-2 h-8 w-8 text-purple-600" />
              <div className="text-3xl font-bold">0</div>
              <div className="text-muted-foreground text-sm">Alerts Today</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Code className="mx-auto mb-2 h-8 w-8 text-orange-600" />
              <div className="text-3xl font-bold">0</div>
              <div className="text-muted-foreground text-sm">Auto Scans</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Webhook List */}
      <Card>
        <CardHeader>
          <CardTitle>Configured Webhooks</CardTitle>
          <CardDescription>
            Manage your repository webhooks and monitoring rules
          </CardDescription>
        </CardHeader>
        <CardContent>
          {webhooks.length === 0 ? (
            <div className="py-12 text-center">
              <Webhook className="mx-auto mb-4 h-12 w-12 opacity-20" />
              <p className="text-muted-foreground mb-4">
                No webhooks configured yet
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Webhook
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {webhooks.map((webhook) => (
                <WebhookCard
                  key={webhook.id}
                  webhook={webhook}
                  onToggle={handleToggleWebhook}
                  onDelete={handleDeleteWebhook}
                  onSelect={setSelectedWebhook}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

interface WebhookCardProps {
  webhook: WebhookConfig;
  onToggle: (id: string, active: boolean) => void;
  onDelete: (id: string) => void;
  onSelect: (webhook: WebhookConfig) => void;
}

const WebhookCard: React.FC<WebhookCardProps> = ({
  webhook,
  onToggle,
  onDelete,
  onSelect,
}) => {
  const providerColors = {
    github: "bg-gray-900 text-white",
    gitlab: "bg-orange-600 text-white",
    bitbucket: "bg-blue-600 text-white",
  };

  return (
    <div
      className={cn(
        "rounded-lg border p-4 transition-all",
        webhook.active ? "border-primary/50" : "border-border opacity-60"
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-3">
            <Badge className={providerColors[webhook.provider]}>
              {webhook.provider}
            </Badge>
            <h3 className="font-semibold">{webhook.repositoryName}</h3>
            {webhook.active && (
              <Badge variant="secondary" className="bg-green-500 text-white">
                Active
              </Badge>
            )}
          </div>

          <p className="text-muted-foreground mb-3 text-sm">
            {webhook.repositoryUrl}
          </p>

          <div className="flex flex-wrap gap-2">
            {webhook.events.map((event) => (
              <Badge key={event} variant="outline" className="text-xs">
                {event}
              </Badge>
            ))}
          </div>

          {webhook.lastTriggered && (
            <p className="text-muted-foreground mt-2 text-xs">
              Last triggered: {new Date(webhook.lastTriggered).toLocaleString()}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Switch
            checked={webhook.active}
            onCheckedChange={(checked) => onToggle(webhook.id!, checked)}
          />
          <Button variant="ghost" size="icon" onClick={() => onSelect(webhook)}>
            <Settings className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(webhook.id!)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

interface CreateWebhookDialogProps {
  onSubmit: (data: {
    provider: "github" | "gitlab";
    repositoryName: string;
    repositoryUrl: string;
    events: WebhookEvent[];
  }) => void;
  onClose: () => void;
}

const CreateWebhookDialog: React.FC<CreateWebhookDialogProps> = ({
  onSubmit,
  onClose,
}) => {
  const [formData, setFormData] = useState({
    provider: "github" as "github" | "gitlab",
    repositoryName: "",
    repositoryUrl: "",
    events: ["push", "pull_request"] as WebhookEvent[],
  });

  const availableEvents: WebhookEvent[] = [
    "push",
    "pull_request",
    "pull_request_review",
    "commit_comment",
    "repository",
    "release",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const toggleEvent = (event: WebhookEvent) => {
    setFormData((prev) => ({
      ...prev,
      events: prev.events.includes(event)
        ? prev.events.filter((e) => e !== event)
        : [...prev.events, event],
    }));
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Create Webhook</DialogTitle>
        <DialogDescription>
          Configure a webhook to monitor your repository for changes
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="provider">Provider</Label>
          <Select
            value={formData.provider}
            onValueChange={(value: "github" | "gitlab") =>
              setFormData((prev) => ({ ...prev, provider: value }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="github">GitHub</SelectItem>
              <SelectItem value="gitlab">GitLab</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="repositoryName">Repository Name</Label>
          <Input
            id="repositoryName"
            placeholder="my-awesome-project"
            value={formData.repositoryName}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                repositoryName: e.target.value,
              }))
            }
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="repositoryUrl">Repository URL</Label>
          <Input
            id="repositoryUrl"
            placeholder="https://github.com/username/repo"
            value={formData.repositoryUrl}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                repositoryUrl: e.target.value,
              }))
            }
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Events to Monitor</Label>
          <div className="grid grid-cols-2 gap-2">
            {availableEvents.map((event) => (
              <div key={event} className="flex items-center gap-2">
                <Switch
                  checked={formData.events.includes(event)}
                  onCheckedChange={() => toggleEvent(event)}
                />
                <Label className="text-sm">{event}</Label>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!formData.repositoryName || !formData.repositoryUrl}
          >
            Create Webhook
          </Button>
        </div>
      </form>
    </>
  );
};

export default WebhookManagement;
