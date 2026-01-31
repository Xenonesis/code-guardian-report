/**
 * Custom Rules Editor Component
 * UI for creating, editing, and managing custom security rules
 */

import React, { useState, useEffect } from "react";
import {
  CustomRulesEngine,
  CustomRule,
  RuleTemplate,
  RuleCategory,
} from "@/services/rules/CustomRulesEngine";
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Shield,
  Plus,
  Edit,
  Trash2,
  Download,
  Upload,
  Code,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

import { logger } from "@/utils/logger";
const CustomRulesEditor: React.FC = () => {
  const { user } = useAuth();
  const [rules, setRules] = useState<CustomRule[]>([]);
  const [categories, setCategories] = useState<RuleCategory[]>([]);
  const [templates, setTemplates] = useState<RuleTemplate[]>([]);
  const [_selectedRule, setSelectedRule] = useState<CustomRule | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [_isLoading, setIsLoading] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("all");

  useEffect(() => {
    if (user) {
      loadRules();
      loadCategories();
      loadTemplates();
    }
  }, [user]);

  const loadRules = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const data = await CustomRulesEngine.getRules(user.uid);
      setRules(data);
    } catch (error) {
      logger.error("Failed to load rules:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    if (!user) return;

    try {
      const data = await CustomRulesEngine.getRuleCategories(user.uid);
      setCategories(data);
    } catch (error) {
      logger.error("Failed to load categories:", error);
    }
  };

  const loadTemplates = () => {
    const data = CustomRulesEngine.getTemplates();
    setTemplates(data);
  };

  const handleCreateRule = async (
    ruleData: Omit<CustomRule, "id" | "createdAt" | "updatedAt" | "matchCount">
  ) => {
    try {
      await CustomRulesEngine.createRule(ruleData);
      await loadRules();
      await loadCategories();
      setIsCreateDialogOpen(false);
    } catch (error) {
      logger.error("Failed to create rule:", error);
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (!confirm("Are you sure you want to delete this rule?")) return;

    try {
      await CustomRulesEngine.deleteRule(ruleId);
      await loadRules();
      await loadCategories();
    } catch (error) {
      logger.error("Failed to delete rule:", error);
    }
  };

  const handleToggleRule = async (ruleId: string, enabled: boolean) => {
    try {
      await CustomRulesEngine.updateRule(ruleId, { enabled });
      await loadRules();
    } catch (error) {
      logger.error("Failed to toggle rule:", error);
    }
  };

  const handleExportRules = async () => {
    if (!user) return;

    try {
      const json = await CustomRulesEngine.exportRules(user.uid);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `custom-rules-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      logger.error("Failed to export rules:", error);
    }
  };

  const handleImportRules = async (file: File) => {
    if (!user) return;

    try {
      const text = await file.text();
      const result = await CustomRulesEngine.importRules(user.uid, text);

      if (result.imported > 0) {
        await loadRules();
        await loadCategories();
      }

      alert(`Imported: ${result.imported}, Failed: ${result.failed}`);
    } catch (error) {
      logger.error("Failed to import rules:", error);
    }
  };

  const filteredRules =
    filterCategory === "all"
      ? rules
      : rules.filter((r) => r.category === filterCategory);

  if (!user) {
    return (
      <div className="py-12 text-center">
        <Shield className="mx-auto mb-4 h-12 w-12 opacity-20" />
        <p className="text-muted-foreground">
          Please sign in to manage custom rules
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
            <Code className="text-primary h-8 w-8" />
            Custom Rules Engine
          </h2>
          <p className="text-muted-foreground mt-2">
            Define and manage your own security rules and patterns
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportRules}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              const input = document.createElement("input");
              input.type = "file";
              input.accept = ".json";
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) handleImportRules(file);
              };
              input.click();
            }}
          >
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Rule
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[700px]">
              <CreateRuleDialog
                onSubmit={handleCreateRule}
                onClose={() => setIsCreateDialogOpen(false)}
                userId={user.uid}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Code className="mx-auto mb-2 h-8 w-8 text-blue-600" />
              <div className="text-3xl font-bold">{rules.length}</div>
              <div className="text-muted-foreground text-sm">Total Rules</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="mx-auto mb-2 h-8 w-8 text-green-600" />
              <div className="text-3xl font-bold">
                {rules.filter((r) => r.enabled).length}
              </div>
              <div className="text-muted-foreground text-sm">Active Rules</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Shield className="mx-auto mb-2 h-8 w-8 text-purple-600" />
              <div className="text-3xl font-bold">{categories.length}</div>
              <div className="text-muted-foreground text-sm">Categories</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertTriangle className="mx-auto mb-2 h-8 w-8 text-orange-600" />
              <div className="text-3xl font-bold">
                {rules.reduce((sum, r) => sum + (r.matchCount || 0), 0)}
              </div>
              <div className="text-muted-foreground text-sm">Total Matches</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="rules" className="space-y-4">
        <TabsList>
          <TabsTrigger value="rules">My Rules</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="public">Community Rules</TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="space-y-4">
          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <Label>Filter by category:</Label>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.name} value={cat.name}>
                    {cat.icon} {cat.name} ({cat.ruleCount})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Rules List */}
          <Card>
            <CardHeader>
              <CardTitle>Your Custom Rules</CardTitle>
              <CardDescription>
                Manage and organize your security rules
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredRules.length === 0 ? (
                <div className="py-12 text-center">
                  <Code className="mx-auto mb-4 h-12 w-12 opacity-20" />
                  <p className="text-muted-foreground mb-4">
                    No custom rules yet
                  </p>
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Rule
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredRules.map((rule) => (
                    <RuleCard
                      key={rule.id}
                      rule={rule}
                      onToggle={handleToggleRule}
                      onDelete={handleDeleteRule}
                      onEdit={setSelectedRule}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Rule Templates</CardTitle>
              <CardDescription>
                Start with pre-built rule templates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {templates.map((template) => (
                  <TemplateCard
                    key={template.name}
                    template={template}
                    onUse={async () => {
                      if (!user) return;
                      try {
                        await CustomRulesEngine.createFromTemplate(
                          user.uid,
                          template.name
                        );
                        await loadRules();
                        await loadCategories();
                      } catch (error) {
                        logger.error("Failed to create from template:", error);
                      }
                    }}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="public">
          <Card>
            <CardHeader>
              <CardTitle>Community Rules</CardTitle>
              <CardDescription>
                Browse and import rules shared by the community
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="py-12 text-center">
                <Shield className="mx-auto mb-4 h-12 w-12 opacity-20" />
                <p className="text-muted-foreground">
                  Community rules coming soon!
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface RuleCardProps {
  rule: CustomRule;
  onToggle: (id: string, enabled: boolean) => void;
  onDelete: (id: string) => void;
  onEdit: (rule: CustomRule) => void;
}

const RuleCard: React.FC<RuleCardProps> = ({
  rule,
  onToggle,
  onDelete,
  onEdit,
}) => {
  const severityColors = {
    Critical: "bg-red-500",
    High: "bg-orange-500",
    Medium: "bg-yellow-500",
    Low: "bg-blue-500",
  };

  return (
    <div
      className={cn(
        "rounded-lg border p-4 transition-all",
        rule.enabled ? "border-primary/50" : "border-border opacity-60"
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-2">
            <h3 className="font-semibold">{rule.name}</h3>
            <Badge className={cn("text-white", severityColors[rule.severity])}>
              {rule.severity}
            </Badge>
            <Badge variant="outline">{rule.type}</Badge>
            {rule.enabled && (
              <Badge variant="secondary" className="bg-green-500 text-white">
                Active
              </Badge>
            )}
          </div>

          <p className="text-muted-foreground mb-2 text-sm">
            {rule.description}
          </p>

          <div className="text-muted-foreground flex items-center gap-2 text-xs">
            <span className="capitalize">{rule.language}</span>
            <span>•</span>
            <span>{rule.category}</span>
            {rule.matchCount && rule.matchCount > 0 && (
              <>
                <span>•</span>
                <span>{rule.matchCount} matches</span>
              </>
            )}
          </div>

          <div className="mt-2 flex flex-wrap gap-1">
            {rule.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Switch
            checked={rule.enabled}
            onCheckedChange={(checked) => onToggle(rule.id!, checked)}
          />
          <Button variant="ghost" size="icon" onClick={() => onEdit(rule)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(rule.id!)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

interface TemplateCardProps {
  template: RuleTemplate;
  onUse: () => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, onUse }) => {
  const severityColors = {
    Critical: "bg-red-500",
    High: "bg-orange-500",
    Medium: "bg-yellow-500",
    Low: "bg-blue-500",
  };

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{template.name}</CardTitle>
          <Badge
            className={cn("text-white", severityColors[template.severity])}
          >
            {template.severity}
          </Badge>
        </div>
        <CardDescription>{template.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <Badge variant="outline">{template.language}</Badge>
            <Badge variant="outline">{template.category}</Badge>
          </div>
          <Button size="sm" onClick={onUse}>
            <Plus className="mr-2 h-4 w-4" />
            Use Template
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

interface CreateRuleDialogProps {
  onSubmit: (rule: any) => void;
  onClose: () => void;
  userId: string;
}

const CreateRuleDialog: React.FC<CreateRuleDialogProps> = ({
  onSubmit,
  onClose,
  userId,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "Security",
    language: "javascript" as any,
    severity: "Medium" as any,
    type: "regex" as any,
    message: "",
    recommendation: "",
    tags: "",
    pattern: "",
    flags: "g",
    enabled: true,
    isPublic: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const rule = {
      userId,
      name: formData.name,
      description: formData.description,
      category: formData.category,
      language: formData.language,
      severity: formData.severity,
      type: formData.type,
      message: formData.message,
      recommendation: formData.recommendation,
      tags: formData.tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t),
      enabled: formData.enabled,
      isPublic: formData.isPublic,
      regex:
        formData.type === "regex"
          ? {
              pattern: formData.pattern,
              flags: formData.flags,
            }
          : undefined,
      pattern:
        formData.type === "pattern"
          ? {
              search: formData.pattern,
              flags: formData.flags,
            }
          : undefined,
    };

    const validation = CustomRulesEngine.validateRule(rule);
    if (!validation.valid) {
      alert("Validation failed:\n" + validation.errors.join("\n"));
      return;
    }

    onSubmit(rule);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Create Custom Rule</DialogTitle>
        <DialogDescription>
          Define a new security rule with custom patterns
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Rule Name *</Label>
            <Input
              id="name"
              placeholder="My Custom Rule"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, category: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Security">Security</SelectItem>
                <SelectItem value="Performance">Performance</SelectItem>
                <SelectItem value="Best Practices">Best Practices</SelectItem>
                <SelectItem value="Maintainability">Maintainability</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="What does this rule check for?"
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            rows={2}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Select
              value={formData.language}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, language: value as any }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Languages</SelectItem>
                <SelectItem value="javascript">JavaScript</SelectItem>
                <SelectItem value="typescript">TypeScript</SelectItem>
                <SelectItem value="python">Python</SelectItem>
                <SelectItem value="java">Java</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="severity">Severity</Label>
            <Select
              value={formData.severity}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, severity: value as any }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Critical">Critical</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Rule Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, type: value as any }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="regex">Regex</SelectItem>
                <SelectItem value="pattern">Pattern</SelectItem>
                <SelectItem value="ast">AST Query</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="pattern">Pattern/Regex *</Label>
          <Input
            id="pattern"
            placeholder="e.g., console\.log|api[_-]?key"
            value={formData.pattern}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, pattern: e.target.value }))
            }
            required
          />
          <p className="text-muted-foreground text-xs">
            Enter a regex pattern or search string
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="message">Message *</Label>
          <Input
            id="message"
            placeholder="What message to show when matched?"
            value={formData.message}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, message: e.target.value }))
            }
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="recommendation">Recommendation</Label>
          <Textarea
            id="recommendation"
            placeholder="How to fix this issue?"
            value={formData.recommendation}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                recommendation: e.target.value,
              }))
            }
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tags">Tags (comma-separated)</Label>
          <Input
            id="tags"
            placeholder="security, production, critical"
            value={formData.tags}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, tags: e.target.value }))
            }
          />
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch
              checked={formData.enabled}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, enabled: checked }))
              }
            />
            <Label>Enable immediately</Label>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={formData.isPublic}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, isPublic: checked }))
              }
            />
            <Label>Make public</Label>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Create Rule</Button>
        </div>
      </form>
    </>
  );
};

export default CustomRulesEditor;
