import { useState } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { handleSocketRequests } from "../pages/game/api";
import { globalState } from "../globalState";
import { Message } from "@/types";

interface props {
  isOpen: boolean;
  onClose: () => void;
}


export const ModalForGuest = ({ isOpen, onClose}: props) => {
  
  return (
    <div>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex justify-center">
              Choose your display name
            </DialogTitle>
            <DialogDescription className="p-2 mt-4">
              <Label className="text-black" htmlFor="display">
                Display name
              </Label>
              <Input
                onChange={(e) => {
                  localStorage.setItem("userName",e.target.value)
                }}
                className="mt-2"
                id="display"
                type="text"
                placeholder="Enter name"
              />
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};
