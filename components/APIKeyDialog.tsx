import React, { useEffect } from "react";
import { View } from "react-native";
import { useForm, Controller } from "react-hook-form";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { Text } from "~/components/ui/text";
import * as SecureStore from "expo-secure-store";
import {
  getManagedAPIKey,
  setManagedAPIKey,
} from "~/src/services/keyManagement";
interface APIKeyDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  anthropicApiKey: string;
}

export function APIKeyDialog({ isOpen, onClose }: APIKeyDialogProps) {
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    trigger,
    setValue,
    setFocus,
  } = useForm<FormData>({
    defaultValues: {
      anthropicApiKey: "",
    },
    mode: "onChange", // This will make isValid update on change
  });

  useEffect(() => {
    const fetchAPIKey = async () => {
      const anthropicAPI = await getManagedAPIKey();
      if (anthropicAPI) {
        setValue("anthropicApiKey", anthropicAPI);
      }
    };
    fetchAPIKey();
  }, []);

  const onSubmit = async (data: FormData) => {
    const isValid = await trigger();
    if (isValid) {
      // Process the valid form data
      console.log(data);
      // Save the API key

      await setManagedAPIKey(data.anthropicApiKey);
      onClose();
    } else {
      // Focus on the first invalid field
      const firstError = Object.keys(errors)[0] as keyof FormData;
      setFocus(firstError);
    }
  };

  const handleClose = async () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="pb-0 mb-0">
          <DialogTitle>Edit API Keys</DialogTitle>
          <DialogDescription>
            Your API Keys are used to authenticate with AI services. They are
            encrypted and stored locally.
          </DialogDescription>
          <Separator />
        </DialogHeader>
        <View className="flex flex-col gap-2">
          <Label nativeID="api_key" className="m-0 p-0 relative left-2">
            Anthropic Claude *
          </Label>
          <Controller
            name="anthropicApiKey"
            control={control}
            rules={{
              required: "* API Key is required",
              minLength: {
                value: 106,
                message: "Claude API Key should be 108 characters",
              },
            }}
            render={({ field: { onChange, onBlur, value, ref } }) => (
              <Input
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                ref={ref}
                className="border rounded-full p-2 pl-5 !h-12 bg-accent"
                placeholder="Enter API Key..."
                secureTextEntry={true}
              />
            )}
          />
          {errors.anthropicApiKey && (
            <Text className="text-red-500 text-sm mt-1">
              {errors.anthropicApiKey.message}
            </Text>
          )}
          <DialogFooter className="mt-2">
            <Button onPress={handleSubmit(onSubmit)} className="!h-14">
              <Text>Save</Text>
            </Button>
          </DialogFooter>
        </View>
      </DialogContent>
    </Dialog>
  );
}
