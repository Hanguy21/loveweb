import { createClient } from "@/utils/supabase/client";

export interface Message {
  id: number;
  title: string;
  content: string;
  emoji: string;
}

export interface ProposalConfig {
  line1: string;
  line2: string;
  yesLabel: string;
  acceptedTitle: string;
  acceptedSub: string;
}

export const DEFAULT_MESSAGES: Message[] = [
  { id: 1, title: "Lần đầu gặp nhau...", emoji: "🌸", content: "Lần đầu tiên nhìn thấy em, trái tim mình đã đập loạn nhịp. Có một điều gì đó rất đặc biệt ở em mà mình không thể giải thích được." },
  { id: 2, title: "Điều mình thích ở em...", emoji: "✨", content: "Mình thích cái cách em cười, cái cách em nói chuyện, và cả những lúc em vô tình chạm vào trái tim mình mà không biết." },
  { id: 3, title: "Những lúc nhớ em...", emoji: "🌙", content: "Có những đêm khuya, mình cứ nghĩ mãi về em. Tự hỏi lúc này em đang làm gì, có đang nghĩ đến mình không..." },
  { id: 4, title: "Mình muốn nói với em...", emoji: "💌", content: "Mình muốn được ở cạnh em, lắng nghe em kể chuyện, cùng em đi qua những ngày nắng và cả những ngày mưa." },
  { id: 5, title: "Và điều quan trọng nhất...", emoji: "💕", content: "Em có thể chưa biết, nhưng em đã trở thành một phần rất quan trọng trong cuộc sống của mình rồi. Mình thích em thật sự." },
];

export const DEFAULT_PROPOSAL: ProposalConfig = {
  line1: "Em có chịu làm",
  line2: "người yêu của mình không? 🥺",
  yesLabel: "Có chứ! 💗",
  acceptedTitle: "Yêu nhau nha! 💕",
  acceptedSub: "Mình hứa sẽ luôn ở bên em 🌸",
};

export async function getMessages(): Promise<Message[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .order("id");
    if (error || !data || data.length === 0) return DEFAULT_MESSAGES;
    return data as Message[];
  } catch {
    return DEFAULT_MESSAGES;
  }
}

export async function saveMessages(messages: Message[]): Promise<void> {
  const supabase = createClient();
  for (const msg of messages) {
    await supabase.from("messages").upsert({
      id: msg.id,
      title: msg.title,
      content: msg.content,
      emoji: msg.emoji,
    });
  }
}

export async function getProposal(): Promise<ProposalConfig> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("proposal_config")
      .select("*")
      .eq("id", 1)
      .single();
    if (error || !data) return DEFAULT_PROPOSAL;
    return {
      line1: data.line1,
      line2: data.line2,
      yesLabel: data.yes_label,
      acceptedTitle: data.accepted_title,
      acceptedSub: data.accepted_sub,
    };
  } catch {
    return DEFAULT_PROPOSAL;
  }
}

export async function saveProposal(config: ProposalConfig): Promise<void> {
  const supabase = createClient();
  await supabase.from("proposal_config").upsert({
    id: 1,
    line1: config.line1,
    line2: config.line2,
    yes_label: config.yesLabel,
    accepted_title: config.acceptedTitle,
    accepted_sub: config.acceptedSub,
  });
}
