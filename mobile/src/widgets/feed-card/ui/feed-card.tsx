import { View } from "react-native";
import { Bookmark, Check, X } from "lucide-react-native";

import { AudioPlayer } from "@/widgets/audio-player";
import { Badge, Button, Card, Text } from "@/components/ui";
import type { RecommendationCard } from "@/entities/recommendation";
import { BRAND_COLORS } from "@/shared/constants/brand";

type FeedCardProps = {
  card: RecommendationCard;
  onLike?: () => void;
  onSave?: () => void;
  onSkip?: () => void;
};

export function FeedCard({ card, onLike, onSave, onSkip }: FeedCardProps) {
  const profile = card.profile.user_account;
  const beat = card.profile.preview_beat;

  return (
    <Card className="gap-5">
      <View className="gap-2">
        <View className="flex-row items-start justify-between gap-4">
          <View className="min-w-0 flex-1">
            <Text numberOfLines={1} variant="heading">
              {profile.name}
            </Text>
            <Text variant="muted">
              {profile.role}
              {profile.location ? ` in ${profile.location}` : ""}
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-3xl font-bold text-primary">{card.match.score}%</Text>
            <Text variant="caption">Match</Text>
          </View>
        </View>
        <View className="flex-row flex-wrap gap-2">
          {profile.tags.slice(0, 4).map((tag) => (
            <Badge key={tag}>{tag}</Badge>
          ))}
        </View>
      </View>

      <AudioPlayer track={beat} />

      {card.match.reasons.length ? (
        <View className="gap-1">
          <Text variant="label">Why you match</Text>
          {card.match.reasons.slice(0, 3).map((reason) => (
            <Text key={reason} variant="muted">
              {reason}
            </Text>
          ))}
        </View>
      ) : null}

      <View className="flex-row gap-3">
        <Button className="flex-1" onPress={onSkip} variant="outline">
          <X color={BRAND_COLORS.destructive} size={18} />
          <Text className="font-semibold text-foreground">Skip</Text>
        </Button>
        <Button onPress={onSave} size="icon" variant="secondary">
          <Bookmark color={BRAND_COLORS.foreground} size={18} />
        </Button>
        <Button className="flex-1" onPress={onLike}>
          <Check color={BRAND_COLORS.foreground} size={18} />
          <Text className="font-semibold text-primary-foreground">Connect</Text>
        </Button>
      </View>
    </Card>
  );
}
