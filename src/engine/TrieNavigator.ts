import { Contact } from '../data/mockDirectory';

export class TrieNode {
  prefix: string;
  depth: number;
  parent: TrieNode | null = null;
  children: TrieNode[] = [];
  nextSibling: TrieNode | null = null;
  prevSibling: TrieNode | null = null;
  contact?: Contact;
  linearIndex: number = -1; 

  constructor(prefix: string, depth: number) {
    this.prefix = prefix;
    this.depth = depth;
  }

  public getFirstLeaf(): TrieNode {
    let curr: TrieNode = this;
    while (curr.children.length > 0) {
      curr = curr.children[0];
    }
    return curr;
  }

  public getAncestorAtDepth(targetDepth: number): TrieNode {
    let curr: TrieNode = this;
    while (curr.parent && curr.depth > targetDepth) {
      curr = curr.parent;
    }
    return curr;
  }
}

export class TrieNavigator {
  root: TrieNode;
  leaves: TrieNode[] = [];
  depthNodes: { [depth: number]: TrieNode[] } = { 1: [], 2: [], 3: [], 4: [] };

  constructor(contacts: Contact[]) {
    this.root = new TrieNode("", 0);
    this.buildTrie(contacts);
    this.buildLateralLinks();
  }

  private buildTrie(contacts: Contact[]) {
    for (let i = 0; i < contacts.length; i++) {
      const contact = contacts[i];
      let current = this.root;
      
      // Use clean alphanumeric chars for prefix levels
      const cleanName = contact.name.toUpperCase();
      
      for (let depth = 1; depth <= 4; depth++) {
        // Stop creating depth nodes if the name is too short (e.g., "Wu")
        // But we need to ensure the depth hierarchy remains intact for gear shifting.
        // If name is short, just pad it or use the full name as prefix to keep the structure.
        const prefix = cleanName.substring(0, Math.min(depth, cleanName.length));
        
        let child = current.children.find(c => c.prefix === prefix);
        if (!child) {
          child = new TrieNode(prefix, depth);
          child.parent = current;
          current.children.push(child);
          this.depthNodes[depth].push(child);
        }
        current = child;
      }
      
      // Depth 5: The Leaf (Gear 1)
      const leaf = new TrieNode(contact.name, 5);
      leaf.parent = current;
      leaf.contact = contact;
      leaf.linearIndex = i;
      current.children.push(leaf);
      this.leaves.push(leaf);
    }
  }

  private buildLateralLinks() {
    for (let depth = 1; depth <= 4; depth++) {
      const nodes = this.depthNodes[depth];
      for (let i = 0; i < nodes.length; i++) {
        nodes[i].prevSibling = i > 0 ? nodes[i-1] : null;
        nodes[i].nextSibling = i < nodes.length - 1 ? nodes[i+1] : null;
      }
    }
    // Link Leaves
    for (let i = 0; i < this.leaves.length; i++) {
      this.leaves[i].prevSibling = i > 0 ? this.leaves[i-1] : null;
      this.leaves[i].nextSibling = i < this.leaves.length - 1 ? this.leaves[i+1] : null;
    }
  }

  public getLeafAt(index: number): TrieNode {
    return this.leaves[Math.max(0, Math.min(index, this.leaves.length - 1))];
  }
}
