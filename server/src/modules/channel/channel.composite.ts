// ─────────────────────────────────────────────────────────
// Channel Composite — COMPOSITE PATTERN
// ─────────────────────────────────────────────────────────
// Models the hierarchical relationship:
//   Channel → Streams → Comments
//
// Each node in the tree implements ChannelComponent interface,
// allowing uniform treatment of individual objects and
// compositions. This provides a clean way to aggregate
// and display the full channel hierarchy.
// ─────────────────────────────────────────────────────────

/**
 * Component interface — common to all nodes in the tree.
 */
export interface ChannelComponent {
  getDetails(): ChannelComponentDetails;
}

export interface ChannelComponentDetails {
  type: 'channel' | 'stream' | 'comment';
  id: string;
  data: Record<string, any>;
  children: ChannelComponentDetails[];
}

/**
 * Leaf: CommentLeaf — a chat message with no children.
 */
export class CommentLeaf implements ChannelComponent {
  constructor(
    private readonly id: string,
    private readonly content: string,
    private readonly userName: string,
    private readonly createdAt: Date,
  ) {}

  getDetails(): ChannelComponentDetails {
    return {
      type: 'comment',
      id: this.id,
      data: {
        content: this.content,
        userName: this.userName,
        createdAt: this.createdAt,
      },
      children: [],
    };
  }
}

/**
 * Composite: StreamComposite — contains comment leaves.
 */
export class StreamComposite implements ChannelComponent {
  private children: ChannelComponent[] = [];

  constructor(
    private readonly id: string,
    private readonly title: string,
    private readonly status: string,
    private readonly startedAt: Date | null,
  ) {}

  add(component: ChannelComponent): void {
    this.children.push(component);
  }

  getDetails(): ChannelComponentDetails {
    return {
      type: 'stream',
      id: this.id,
      data: {
        title: this.title,
        status: this.status,
        startedAt: this.startedAt,
        commentCount: this.children.length,
      },
      children: this.children.map((child) => child.getDetails()),
    };
  }
}

/**
 * Composite: ChannelComposite — root node containing streams.
 */
export class ChannelComposite implements ChannelComponent {
  private children: ChannelComponent[] = [];

  constructor(
    private readonly id: string,
    private readonly name: string,
    private readonly ownerName: string,
  ) {}

  add(component: ChannelComponent): void {
    this.children.push(component);
  }

  getDetails(): ChannelComponentDetails {
    return {
      type: 'channel',
      id: this.id,
      data: {
        name: this.name,
        ownerName: this.ownerName,
        streamCount: this.children.length,
      },
      children: this.children.map((child) => child.getDetails()),
    };
  }
}

/**
 * Factory function to build a composite tree from raw DB data.
 */
export function buildChannelComposite(channelData: any): ChannelComponentDetails {
  const channel = new ChannelComposite(
    channelData.id,
    channelData.name,
    channelData.user?.name || 'Unknown',
  );

  for (const stream of channelData.streams || []) {
    const streamComposite = new StreamComposite(
      stream.id,
      stream.title,
      stream.status,
      stream.startedAt,
    );

    for (const comment of stream.comments || []) {
      const commentLeaf = new CommentLeaf(
        comment.id,
        comment.content,
        comment.user?.name || 'Anonymous',
        comment.createdAt,
      );
      streamComposite.add(commentLeaf);
    }

    channel.add(streamComposite);
  }

  return channel.getDetails();
}
