import * as React from "react";
import { FlatList, RefreshControl, ScrollView, View } from "react-native";
import { ChatSession } from "~/app/_layout";
import { Button } from "./ui/button";
import { Text } from "./ui/text";
import { Input } from "./ui/input";
import { Search } from "~/lib/icons/Search";
import { Plus } from "~/lib/icons/Plus";
import { SquarePen } from "~/lib/icons/SquarePen";

interface CustomDrawerContentProps {
  navigation: any;
  sessions: ChatSession[];
  loadSessions: () => Promise<void>;
}

export function CustomDrawerContent({
  navigation,
  sessions,
  loadSessions,
}: CustomDrawerContentProps) {
  const [searchState, setSearchState] = React.useState("");
  const [filteredSessions, setFilteredSessions] = React.useState(sessions);
  const [refreshing, setRefreshing] = React.useState(false);
  const handleSearchChange = (text: string) => {
    setSearchState(text);
    const filtered =
      text === ""
        ? sessions
        : sessions.filter((session) =>
            session.topic.toLowerCase().includes(text.toLowerCase())
          );
    setFilteredSessions(filtered);
  };

  const refresh = async () => {
    setRefreshing(true);
    await loadSessions();
    setSearchState("");
    setRefreshing(false);
  };

  React.useEffect(() => {
    setFilteredSessions(sessions);
  }, [sessions]);

  const renderSessionItem = ({ item }: { item: ChatSession }) => (
    <View className="flex-1 h-14">
      <Button
        variant={"ghost"}
        className="items-start py-12 flex-1 pl-4"
        onPress={() =>
          navigation.navigate("index", {
            sessionId: item.id,
            topic: item.topic,
          })
        }
        style={{ padding: 10 }}
      >
        <Text className="ml-3">{item.topic}</Text>
      </Button>
    </View>
  );

  return (
    <View className="flex-1 bg-background mt-8 p-6 pl-2">
      <View className="relative">
        <Input
          className=" h-28 border rounded-3xl p-2 pl-12 bg-accent"
          placeholder="Type To Search..."
          value={searchState}
          onChangeText={handleSearchChange}
        />
        <Search
          className="absolute top-3 left-3 text-foreground/80"
          size={22}
        />
      </View>
      <View className="h-14 my-1">
        <Button
          className="items-start flex-1 flex-row gap-2 justify-start "
          variant={"ghost"}
          onPress={() =>
            navigation.navigate("index", {
              sessionId: undefined,
              topic: "",
            })
          }
        >
          <Plus className="text-foreground/80" size={22} />
          <Text>New Session</Text>
        </Button>
      </View>
      <View className="h-14 my-1">
        <Button
          className="items-start flex-1 flex-row gap-2 justify-start "
          variant={"ghost"}
          onPress={() =>
            navigation.navigate("anthropic", {
              sessionId: undefined,
              topic: "",
            })
          }
        >
          <SquarePen className="text-foreground/80" size={22} />
          <Text>Anthropic Test</Text>
        </Button>
      </View>
      {/* <Text>{filteredSessions.map((session) => session.topic)}</Text> */}
      <ScrollView
        className="flex-1 flex-grow"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} />
        }
      >
        <View className="flex flex-col">
          {filteredSessions.map((item) => (
            <View key={item.id} className="flex-1 h-14">
              <Button
                variant={"ghost"}
                className="items-start py-12 flex-1 pl-4"
                onPress={() =>
                  navigation.navigate("index", {
                    sessionId: item.id,
                    topic: item.topic,
                  })
                }
                style={{ padding: 10 }}
              >
                <Text className="ml-3">{item.topic}</Text>
              </Button>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
