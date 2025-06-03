"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useVariableStore } from "@/stores/variable-store";
import { Trash2, Plus } from "lucide-react";
import { Label } from "@/components/ui/label";

export function VariableManager() {
  const { variables, addVariable, updateVariable, deleteVariable } =
    useVariableStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newVar, setNewVar] = useState({ key: "", value: "", label_fr: "", label_en: "" });

  const handleAdd = () => {
    if (!newVar.key) return;
    addVariable({
      key: newVar.key,
      value: newVar.value,
      label_json: { fr: newVar.label_fr, en: newVar.label_en },
    });
    setNewVar({ key: "", value: "", label_fr: "", label_en: "" });
    setDialogOpen(false);
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Variables</CardTitle>
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-4">
        {variables.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucune variable</p>
        ) : (
          <ScrollArea className="h-64 pr-4">
            <div className="space-y-4">
              {variables.map((variable) => (
                <div key={variable.id} className="flex items-start gap-2">
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs">{variable.key}</Label>
                    <Input
                      value={variable.value}
                      onChange={(e) =>
                        updateVariable(variable.id, { value: e.target.value })
                      }
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteVariable(variable.id)}
                    className="mt-6"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouvelle variable</DialogTitle>
            <DialogDescription>
              Définissez une clé, un label et une valeur initiale
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Clé</Label>
              <Input
                value={newVar.key}
                onChange={(e) => setNewVar({ ...newVar, key: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Label FR</Label>
                <Input
                  value={newVar.label_fr}
                  onChange={(e) => setNewVar({ ...newVar, label_fr: e.target.value })}
                />
              </div>
              <div>
                <Label>Label EN</Label>
                <Input
                  value={newVar.label_en}
                  onChange={(e) => setNewVar({ ...newVar, label_en: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Valeur</Label>
              <Input
                value={newVar.value}
                onChange={(e) => setNewVar({ ...newVar, value: e.target.value })}
              />
            </div>
            <Button className="w-full" onClick={handleAdd}>
              Ajouter
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
