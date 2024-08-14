import { View } from "react-native";
import { Input } from "../input";
import { Button } from "../button";
import { Headphones } from "~/lib/icons/headphones";
import { ArrowUp } from "~/lib/icons/ArrowUp";
import { Text } from "../text";
import { useForm, Controller } from "react-hook-form";

interface InputAreaProps {
  onSend: (text: string) => void;
  onVoiceMode: () => void;
}

type ChatForm = {
  message: string;
};

export const InputArea: React.FC<InputAreaProps> = ({
  onSend,
  onVoiceMode,
}) => {
  const { control, handleSubmit, reset, formState } = useForm<ChatForm>({
    defaultValues: {
      message: "",
    },
  });

  const onSubmit = (data: ChatForm) => {
    if (data.message.trim()) {
      onSend(data.message);
      reset();
    }
  };

  return (
    <View className="flex-row p-0 gap-2 justify-between">
      <Controller
        control={control}
        rules={{
          required: true,
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            className="flex-1 border rounded-full p-2 pl-5 !h-14 bg-accent"
            onBlur={onBlur}
            onChangeText={onChange}
            onSubmitEditing={handleSubmit(onSubmit)}
            value={value}
            placeholder="Type a message..."
          />
        )}
        name="message"
      />
      {formState.isValid ? (
        <Button
          onPress={handleSubmit(onSubmit)}
          className="duration-200 transition rounded-full !w-14 !h-14 p-0 flex justify-center items-center"
        >
          <ArrowUp className="w-3 h-3 text-background" size={22} />
        </Button>
      ) : (
        <Button
          className="duration-200 transition rounded-full !w-14 !h-14 p-0 flex justify-center items-center"
          variant={"ghost"}
        >
          <Headphones
            className="w-3 h-3 text-foreground"
            size={22}
            onPress={onVoiceMode}
          />
        </Button>
      )}
    </View>
  );
};
