"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  LayoutPanelTop,
  Settings,
  Shuffle,
  Loader2,
  ArrowDown,
  ArrowUp,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { useAutoLayout } from "@/hooks/useAutoLayout";
import { AVAILABLE_ALGORITHMS } from "@/lib/layout/algorithms";
import { LayoutOptions } from "@/lib/layout/types";
import { useGraphBuilderStore } from "@/stores/graph-builder";
import { useMultiTabGraphBuilderStore } from "@/stores/multi-tab-graph-builder";
import { PARAM_TYPES } from "@/types/graph-builder";

interface AutoLayoutControlsProps {
  tabMode?: boolean;
  className?: string;
}

const DIRECTION_OPTIONS = [
  { value: "TB", label: "Top to Bottom", icon: ArrowDown },
  { value: "BT", label: "Bottom to Top", icon: ArrowUp },
  { value: "LR", label: "Left to Right", icon: ArrowRight },
  { value: "RL", label: "Right to Left", icon: ArrowLeft },
] as const;

const ALIGN_OPTIONS = [
  { value: "UL", label: "Upper Left" },
  { value: "UR", label: "Upper Right" },
  { value: "DL", label: "Down Left" },
  { value: "DR", label: "Down Right" },
] as const;

export function AutoLayoutControls({
  tabMode = false,
  className = "",
}: AutoLayoutControlsProps) {
  const {
    layoutState,
    applyLayout,
    updateLayoutOptions,
    autoArrange,
    isApplying,
  } = useAutoLayout({ tabMode });

  const singleTabStore = useGraphBuilderStore();
  const multiTabStore = useMultiTabGraphBuilderStore();

  const [selectedAlgorithm, setSelectedAlgorithm] = useState(
    layoutState.algorithm
  );
  const [showOptions, setShowOptions] = useState(false);

  const handleApplyLayout = async () => {
    await applyLayout(selectedAlgorithm);
  };

  const handleOptionChange = (key: keyof LayoutOptions, value: any) => {
    updateLayoutOptions({ [key]: value });
  };

  const getCurrentDirectionIcon = () => {
    const direction = layoutState.options.direction;
    const option = DIRECTION_OPTIONS.find((opt) => opt.value === direction);
    const Icon = option?.icon || ArrowDown;
    return <Icon className="h-4 w-4" />;
  };

  // Create demo nodes function - Formulaire d'inscription site internet
  const createDemoNodes = async () => {
    const demoNodes = [
      // Email (requis)
      {
        key: "email",
        label_json: { fr: "Adresse email", en: "Email address" },
        type_id: 3, // string
        parent_id: undefined,
        order: 0,
        position: { x: 100, y: 100 },
        help_json: {
          fr: "Votre adresse email principale",
          en: "Your main email address",
        },
        meta_json: { required: true, pattern: "email" },
        condition: undefined,
      },
      // Mot de passe
      {
        key: "password",
        label_json: { fr: "Mot de passe", en: "Password" },
        type_id: 3, // string
        parent_id: undefined,
        order: 1,
        position: { x: 400, y: 100 },
        help_json: { fr: "Au moins 8 caractères", en: "At least 8 characters" },
        meta_json: { required: true, minLength: 8, type: "password" },
        condition: undefined,
      },
      // Confirmation mot de passe
      {
        key: "password_confirm",
        label_json: { fr: "Confirmer le mot de passe", en: "Confirm password" },
        type_id: 3, // string
        parent_id: undefined,
        order: 2,
        position: { x: 700, y: 100 },
        help_json: {
          fr: "Répétez votre mot de passe",
          en: "Repeat your password",
        },
        meta_json: { required: true, type: "password" },
        condition: undefined,
      },
      // Prénom
      {
        key: "first_name",
        label_json: { fr: "Prénom", en: "First name" },
        type_id: 3, // string
        parent_id: undefined,
        order: 3,
        position: { x: 100, y: 200 },
        help_json: { fr: "Votre prénom", en: "Your first name" },
        meta_json: { required: true },
        condition: undefined,
      },
      // Nom de famille
      {
        key: "last_name",
        label_json: { fr: "Nom de famille", en: "Last name" },
        type_id: 3, // string
        parent_id: undefined,
        order: 4,
        position: { x: 400, y: 200 },
        help_json: { fr: "Votre nom de famille", en: "Your last name" },
        meta_json: { required: true },
        condition: undefined,
      },
      // Date de naissance
      {
        key: "birth_date",
        label_json: { fr: "Date de naissance", en: "Birth date" },
        type_id: 5, // date
        parent_id: undefined,
        order: 5,
        position: { x: 700, y: 200 },
        help_json: {
          fr: "Optionnel - pour personnaliser votre expérience",
          en: "Optional - to personalize your experience",
        },
        meta_json: {},
        condition: undefined,
      },
      // Type de compte
      {
        key: "account_type",
        label_json: { fr: "Type de compte", en: "Account type" },
        type_id: 4, // enum
        parent_id: undefined,
        order: 6,
        position: { x: 100, y: 300 },
        help_json: {
          fr: "Choisissez le type de compte qui vous convient",
          en: "Choose the account type that suits you",
        },
        meta_json: {
          required: true,
          enumOptions: [
            {
              id: "personal",
              value: "personal",
              label_json: { fr: "Personnel", en: "Personal" },
            },
            {
              id: "business",
              value: "business",
              label_json: { fr: "Professionnel", en: "Business" },
            },
            {
              id: "organization",
              value: "organization",
              label_json: { fr: "Organisation", en: "Organization" },
            },
          ],
        },
        condition: undefined,
      },
      // Nom de l'entreprise (conditionnel)
      {
        key: "company_name",
        label_json: { fr: "Nom de l'entreprise", en: "Company name" },
        type_id: 3, // string
        parent_id: undefined,
        order: 7,
        position: { x: 400, y: 350 },
        help_json: {
          fr: "Nom de votre entreprise ou organisation",
          en: "Name of your company or organization",
        },
        meta_json: { required: true },
        condition:
          '{"in": [{"var": "account_type"}, ["business", "organization"]]}',
      },
      // Numéro SIRET (conditionnel pour business)
      {
        key: "siret",
        label_json: { fr: "Numéro SIRET", en: "SIRET number" },
        type_id: 3, // string
        parent_id: undefined,
        order: 8,
        position: { x: 700, y: 350 },
        help_json: {
          fr: "Numéro d'identification de votre entreprise",
          en: "Your company identification number",
        },
        meta_json: { pattern: "siret" },
        condition: '{"===": [{"var": "account_type"}, "business"]}',
      },
      // Téléphone
      {
        key: "phone",
        label_json: { fr: "Numéro de téléphone", en: "Phone number" },
        type_id: 3, // string
        parent_id: undefined,
        order: 9,
        position: { x: 100, y: 450 },
        help_json: {
          fr: "Optionnel - pour la sécurité de votre compte",
          en: "Optional - for account security",
        },
        meta_json: { pattern: "phone" },
        condition: undefined,
      },
      // Pays
      {
        key: "country",
        label_json: { fr: "Pays", en: "Country" },
        type_id: 4, // enum
        parent_id: undefined,
        order: 10,
        position: { x: 400, y: 450 },
        help_json: {
          fr: "Votre pays de résidence",
          en: "Your country of residence",
        },
        meta_json: {
          required: true,
          enumOptions: [
            {
              id: "FR",
              value: "FR",
              label_json: { fr: "France", en: "France" },
            },
            {
              id: "BE",
              value: "BE",
              label_json: { fr: "Belgique", en: "Belgium" },
            },
            {
              id: "CH",
              value: "CH",
              label_json: { fr: "Suisse", en: "Switzerland" },
            },
            {
              id: "CA",
              value: "CA",
              label_json: { fr: "Canada", en: "Canada" },
            },
            {
              id: "US",
              value: "US",
              label_json: { fr: "États-Unis", en: "United States" },
            },
          ],
        },
        condition: undefined,
      },
      // Code postal (conditionnel selon pays)
      {
        key: "postal_code",
        label_json: { fr: "Code postal", en: "Postal code" },
        type_id: 3, // string
        parent_id: undefined,
        order: 11,
        position: { x: 700, y: 450 },
        help_json: { fr: "Votre code postal", en: "Your postal code" },
        meta_json: { required: true },
        condition: '{"in": [{"var": "country"}, ["FR", "BE", "CH", "CA"]]}',
      },
      // Newsletter
      {
        key: "newsletter",
        label_json: { fr: "Newsletter", en: "Newsletter" },
        type_id: 6, // boolean
        parent_id: undefined,
        order: 12,
        position: { x: 100, y: 550 },
        help_json: {
          fr: "Recevoir nos actualités et offres spéciales",
          en: "Receive our news and special offers",
        },
        meta_json: {},
        condition: undefined,
      },
      // Fréquence newsletter (conditionnel)
      {
        key: "newsletter_frequency",
        label_json: { fr: "Fréquence newsletter", en: "Newsletter frequency" },
        type_id: 4, // enum
        parent_id: undefined,
        order: 13,
        position: { x: 400, y: 600 },
        help_json: {
          fr: "À quelle fréquence souhaitez-vous recevoir nos emails ?",
          en: "How often would you like to receive our emails?",
        },
        meta_json: {
          enumOptions: [
            {
              id: "weekly",
              value: "weekly",
              label_json: { fr: "Hebdomadaire", en: "Weekly" },
            },
            {
              id: "monthly",
              value: "monthly",
              label_json: { fr: "Mensuel", en: "Monthly" },
            },
            {
              id: "quarterly",
              value: "quarterly",
              label_json: { fr: "Trimestriel", en: "Quarterly" },
            },
          ],
        },
        condition: '{"===": [{"var": "newsletter"}, true]}',
      },
      // Conditions d'utilisation
      {
        key: "terms_accepted",
        label_json: { fr: "Conditions d'utilisation", en: "Terms of service" },
        type_id: 6, // boolean
        parent_id: undefined,
        order: 14,
        position: { x: 100, y: 650 },
        help_json: {
          fr: "J'accepte les conditions d'utilisation",
          en: "I accept the terms of service",
        },
        meta_json: { required: true },
        condition: undefined,
      },
      // Politique de confidentialité
      {
        key: "privacy_accepted",
        label_json: {
          fr: "Politique de confidentialité",
          en: "Privacy policy",
        },
        type_id: 6, // boolean
        parent_id: undefined,
        order: 15,
        position: { x: 400, y: 650 },
        help_json: {
          fr: "J'accepte la politique de confidentialité",
          en: "I accept the privacy policy",
        },
        meta_json: { required: true },
        condition: undefined,
      },
    ];

    if (tabMode) {
      // In tab mode, add nodes and connections to active tab
      const activeTab = multiTabStore.getActiveTab();
      if (!activeTab) {
        multiTabStore.createTab("Formulaire d'inscription");
      }

      // Clear existing nodes - manually clear since clearActiveTab doesn't exist
      const currentTab = multiTabStore.getActiveTab();
      if (currentTab) {
        // Remove all existing nodes and connections
        currentTab.nodes.forEach((node) => {
          multiTabStore.deleteNodeFromActiveTab(node.id);
        });
      }

      // Add demo nodes with small delays to ensure unique IDs
      const nodeIds: string[] = [];
      for (let i = 0; i < demoNodes.length; i++) {
        const nodeId = multiTabStore.addNodeToActiveTab(demoNodes[i]);
        nodeIds.push(nodeId);
        // Small delay to ensure unique timestamps
        if (i < demoNodes.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 2));
        }
      }

      // Add connections pour un formulaire logique
      const connections = [
        // Flux principal des informations de base
        { id: "conn-1", source: nodeIds[0], target: nodeIds[1] }, // email -> password
        { id: "conn-2", source: nodeIds[1], target: nodeIds[2] }, // password -> confirm
        { id: "conn-3", source: nodeIds[0], target: nodeIds[3] }, // email -> prénom
        { id: "conn-4", source: nodeIds[3], target: nodeIds[4] }, // prénom -> nom
        { id: "conn-5", source: nodeIds[4], target: nodeIds[5] }, // nom -> date naissance

        // Type de compte et ses conditionnels
        { id: "conn-6", source: nodeIds[5], target: nodeIds[6] }, // date -> type compte
        { id: "conn-7", source: nodeIds[6], target: nodeIds[7] }, // type compte -> entreprise
        { id: "conn-8", source: nodeIds[7], target: nodeIds[8] }, // entreprise -> siret

        // Informations de contact
        { id: "conn-9", source: nodeIds[6], target: nodeIds[9] }, // type compte -> téléphone
        { id: "conn-10", source: nodeIds[9], target: nodeIds[10] }, // téléphone -> pays
        { id: "conn-11", source: nodeIds[10], target: nodeIds[11] }, // pays -> code postal

        // Préférences et conditions
        { id: "conn-12", source: nodeIds[11], target: nodeIds[12] }, // code postal -> newsletter
        { id: "conn-13", source: nodeIds[12], target: nodeIds[13] }, // newsletter -> fréquence
        { id: "conn-14", source: nodeIds[12], target: nodeIds[14] }, // newsletter -> conditions
        { id: "conn-15", source: nodeIds[14], target: nodeIds[15] }, // conditions -> confidentialité
      ];

      for (let i = 0; i < connections.length; i++) {
        multiTabStore.addConnectionToActiveTab(connections[i]);
        // Small delay between connections too
        if (i < connections.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 1));
        }
      }
    } else {
      // Single tab mode
      singleTabStore.clearGraph();
      for (let i = 0; i < demoNodes.length; i++) {
        singleTabStore.addNode(demoNodes[i]);
        // Small delay to ensure unique timestamps
        if (i < demoNodes.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 2));
        }
      }
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Algorithm Selection */}
      <Select value={selectedAlgorithm} onValueChange={setSelectedAlgorithm}>
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Algorithm" />
        </SelectTrigger>
        <SelectContent>
          {AVAILABLE_ALGORITHMS.map((algorithm) => (
            <SelectItem
              key={algorithm.name}
              value={algorithm.name.toLowerCase()}
            >
              {algorithm.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Apply Layout Button */}
      <Button
        onClick={handleApplyLayout}
        disabled={isApplying}
        className="gap-2"
      >
        {isApplying ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <LayoutPanelTop className="h-4 w-4" />
        )}
        {isApplying ? "Applying..." : "Auto Layout"}
      </Button>

      {/* Layout Options */}
      <Popover open={showOptions} onOpenChange={setShowOptions}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Settings className="h-4 w-4" />
            Options
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="start">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Direction</Label>
              <Select
                value={layoutState.options.direction}
                onValueChange={(value) =>
                  handleOptionChange("direction", value)
                }
              >
                <SelectTrigger>
                  <div className="flex items-center gap-2">
                    {getCurrentDirectionIcon()}
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {DIRECTION_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    return (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {option.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Node Spacing: {layoutState.options.nodeSpacing}px
              </Label>
              <Slider
                value={[layoutState.options.nodeSpacing]}
                onValueChange={([value]) =>
                  handleOptionChange("nodeSpacing", value)
                }
                min={50}
                max={400}
                step={25}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Rank Spacing: {layoutState.options.rankSpacing}px
              </Label>
              <Slider
                value={[layoutState.options.rankSpacing]}
                onValueChange={([value]) =>
                  handleOptionChange("rankSpacing", value)
                }
                min={75}
                max={400}
                step={25}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Alignment</Label>
              <Select
                value={layoutState.options.align}
                onValueChange={(value) => handleOptionChange("align", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ALIGN_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="pt-2 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => autoArrange()}
                className="w-full gap-2 mb-2"
              >
                <Shuffle className="h-4 w-4" />
                Simple Grid Arrange
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => createDemoNodes()}
                className="w-full gap-2"
              >
                <LayoutPanelTop className="h-4 w-4" />
                Create Demo Layout
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
