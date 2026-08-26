export default function Page() {
  return (
    <main className="workspace-shell">

      <section className="board-header">
        <div>
          <p className="eyebrow">Personal workspace / Product team</p>
          <div className="title-row">
            <h1>Product launch</h1>
            <span className="private-label"><span aria-hidden="true">●</span> Private</span>
          </div>
          <p className="board-description">A clear view of what is moving, what is next, and what needs your attention.</p>
        </div>
        <div className="board-actions">
          <button className="secondary-button" type="button"><span aria-hidden="true">☆</span> Star board</button>
          <button className="primary-button" type="button"><span aria-hidden="true">＋</span> Add member</button>
        </div>
      </section>

      <section className="board-toolbar" aria-label="Board tools">
        <div className="toolbar-left">
          <button className="toolbar-button toolbar-button-active" type="button"><span aria-hidden="true">▦</span> Board</button>
          <button className="toolbar-button" type="button"><span aria-hidden="true">☷</span> Table</button>
          <span className="toolbar-divider" />
          <button className="toolbar-button" type="button"><span aria-hidden="true">⚙</span> Views</button>
        </div>
        <div className="toolbar-right">
          <button className="toolbar-button" type="button"><span aria-hidden="true">⌕</span> Filter</button>
          <button className="toolbar-button" type="button"><span aria-hidden="true">↗</span> Share</button>
        </div>
      </section>

      <section className="board" aria-label="Product launch board">
        <BoardColumn title="Ideas" count="3" color="coral" cards={[
          { title: 'Onboarding checklist', tag: 'Research', tagColor: 'sand', text: 'Map the first five minutes for a new teammate.', avatar: 'ML' },
          { title: 'Customer story series', tag: 'Content', tagColor: 'blue', text: 'Collect three short stories from early adopters.', avatar: 'AK' },
          { title: 'Referral rewards', tag: 'Explore', tagColor: 'lavender', text: 'Sketch a lightweight loop for inviting collaborators.', avatar: 'SR' },
        ]} />
        <BoardColumn title="In progress" count="2" color="gold" cards={[
          { title: 'Refresh landing page', tag: 'Design', tagColor: 'pink', text: 'Tighten the message and make the primary action obvious.', avatar: 'AK', progress: '3 / 5' },
          { title: 'Invite flow v2', tag: 'Product', tagColor: 'mint', text: 'Reduce friction when adding the first project member.', avatar: 'JD', progress: '2 / 4' },
        ]} />
        <BoardColumn title="Review" count="2" color="blue" cards={[
          { title: 'Usage dashboard', tag: 'Analytics', tagColor: 'blue', text: 'Review the weekly signal cards with the team.', avatar: 'SR' },
          { title: 'Empty states', tag: 'Design', tagColor: 'pink', text: 'Give every quiet screen a useful next step.', avatar: 'ML' },
        ]} />
        <BoardColumn title="Done" count="3" color="green" cards={[
          { title: 'Set up workspace', tag: 'Launch', tagColor: 'mint', text: 'Create the shared space and define the first rhythm.', avatar: 'AK' },
          { title: 'Project principles', tag: 'Strategy', tagColor: 'sand', text: 'Write down the decisions that keep the work focused.', avatar: 'JD' },
          { title: 'First team retro', tag: 'Team', tagColor: 'lavender', text: 'Capture what to keep, change, and try next.', avatar: 'SR' },
        ]} />
        <button className="add-list-button" type="button"><span aria-hidden="true">＋</span> Add another list</button>
      </section>
    </main>
  );
}

type Card = {
  title: string;
  tag: string;
  tagColor: string;
  text: string;
  avatar: string;
  progress?: string;
};

function BoardColumn({ title, count, color, cards }: { title: string; count: string; color: string; cards: Card[] }) {
  return (
    <section className="list-column">
      <div className="list-heading">
        <div className="list-title"><span className={`status-dot ${color}`} /> <h2>{title}</h2><span className="card-count">{count}</span></div>
        <button className="more-button" type="button" aria-label={`More options for ${title}`} title={`More options for ${title}`}>•••</button>
      </div>
      <div className="card-stack">
        {cards.map((card) => <BoardCard key={card.title} card={card} />)}
      </div>
      <button className="add-card-button" type="button"><span aria-hidden="true">＋</span> Add a card</button>
    </section>
  );
}

function BoardCard({ card }: { card: Card }) {
  return (
    <article className="task-card">
      <div className="card-topline"><span className={`tag ${card.tagColor}`}>{card.tag}</span><button className="card-menu" type="button" aria-label={`More options for ${card.title}`} title={`More options for ${card.title}`}>•••</button></div>
      <h3>{card.title}</h3>
      <p>{card.text}</p>
      <div className="card-footer">
        {card.progress && <span className="progress"><span aria-hidden="true">☷</span> {card.progress}</span>}
        <span className="card-avatar">{card.avatar}</span>
      </div>
    </article>
  );
}