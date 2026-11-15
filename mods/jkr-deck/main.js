// Agents as a sci-fi grid of cards: most urgent first, click a card to focus its pane.

import { View, div, image, svg } from "gpui-kit";
import { v_flex, h_flex } from "gpui-base";
import { agents, run, theme, settings, setAgentOrder } from "herdr";

const RANK = { blocked: 4, done: 3, working: 2, idle: 1 };

// What each state reads as on the deck. Change the words freely: they are only labels.
const TAG = { blocked: "NEEDS YOU", done: "DONE", working: "WORKING", idle: "IDLE" };

const CARD_WIDTH = 214;

function duration(ms) {
  const minutes = Math.floor(ms / 60000);
  if (minutes < 1) return "<1M";
  if (minutes < 60) return `${minutes}M`;
  const hours = Math.floor(minutes / 60);
  return hours < 24 ? `${hours}H` : `${Math.floor(hours / 24)}D`;
}

function programIcon(program, size, color) {
  if (!program?.icon) return null;
  return program.tint ? svg(program.icon).size(size).flex_none().text_color(color) : image(program.icon).w(size).h(size).flex_none();
}

export default class Deck extends View {
  init(_props, cx) {
    // When each agent last changed state, so cards can say how long they have been there.
    this.changed = JSON.parse(localStorage.getItem("changed") ?? "{}");
    cx.timer.every(30000, (cx) => cx.notify());
  }

  track(agentList, now) {
    let dirty = false;
    for (const agent of agentList) {
      const state = agent.status === "done" ? "idle" : agent.status;
      if (this.changed[agent.address]?.state === state) continue;
      this.changed[agent.address] = { state, at: now };
      dirty = true;
    }
    if (dirty) localStorage.setItem("changed", JSON.stringify(this.changed));
  }

  // A corner bracket: two thin strokes in the card's status color.
  corner(color, vertical, horizontal) {
    return div().absolute().size(9)
      .when(vertical === "top", (el) => el.top(-1).border_t(2))
      .when(vertical === "bottom", (el) => el.bottom(-1).border_b(2))
      .when(horizontal === "left", (el) => el.left(-1).border_l(2))
      .when(horizontal === "right", (el) => el.right(-1).border_r(2))
      .border_color(color);
  }

  card(themeColors, agent, index, now) {
    const statusColor = themeColors[agent.status] ?? themeColors.dim;
    const since = this.changed[agent.address]?.at;
    const name = agent.tab_name && !/^\d+$/.test(agent.tab_name) ? agent.tab_name : agent.title || agent.program?.name || agent.address;
    const pulse = agent.status === "working" || agent.status === "blocked";
    return v_flex()
      .id(`deck-${agent.address}`)
      .relative()
      .w(CARD_WIDTH)
      .h(104)
      .flex_none()
      .p(10)
      .gap(6)
      // Translucent glass: the grid shows through. GPUI has no backdrop blur, so the top highlight sells it.
      .bg((agent.focused ? themeColors.selected : themeColors.raised) + "b3")
      .child(div().absolute().top(0).left(0).right(0).h(1).bg(themeColors.foreground + "1f"))
      .border(1)
      .border_color(agent.focused ? themeColors.accent : themeColors.border)
      .cursor_pointer()
      .hover((el) => el.border_color(statusColor))
      .on_click(() => run("pane.focus", { pane: agent.pane }))
      .child(this.corner(statusColor, "top", "left"))
      .child(this.corner(statusColor, "top", "right"))
      .child(this.corner(statusColor, "bottom", "left"))
      .child(this.corner(statusColor, "bottom", "right"))
      // Header: unit number, space and machine.
      .child(h_flex().gap(6).items_center().text_size(10).text_color(themeColors.dim)
        .child(div().text_color(statusColor).child(`#${String(index + 1).padStart(2, "0")}`))
        .child(div().flex_1().min_w(0).truncate().child((agent.space_name || "—").toUpperCase()))
        .child(div().child(agent.address.includes("/") ? agent.address.split("/")[0].toUpperCase() : "LOCAL")))
      .child(div().h(1).w_full().border_t(1).border_dashed().border_color(themeColors.border))
      // Body: program icon and what the agent is on.
      .child(h_flex().gap(7).items_center()
        .when(Boolean(agent.program?.icon), (el) => el.child(programIcon(agent.program, 14, themeColors.foreground)))
        .child(div().flex_1().min_w(0).truncate().text_size(12.5).font_weight(600).text_color(themeColors.foreground).child(name.toUpperCase())))
      .child(div().truncate().text_size(10.5).text_color(themeColors.muted).child(agent.program?.name ?? agent.app ?? ""))
      .child(div().flex_1())
      // Footer: status tag and time in that state.
      .child(h_flex().items_center().justify_between().text_size(10)
        .child(h_flex().gap(5).items_center().px(5).h(16).bg(statusColor + "22").text_color(statusColor)
          .child(div().size(6).bg(statusColor).when(pulse, (el) => el.loop("opacity", { from: 1, to: 0.3, period: 1100 })))
          .child(TAG[agent.status] ?? String(agent.status).toUpperCase()))
        .child(div().text_color(themeColors.dim).child(since ? `T+${duration(now - since)}` : "")));
  }

  render(cx) {
    const themeColors = theme();
    const now = Date.now();
    const agentList = [...agents()].sort((first, second) =>
      (RANK[second.status] ?? 0) - (RANK[first.status] ?? 0) || Number(second.pinned) - Number(first.pinned) || second.seq - first.seq);
    this.track(agentList, now);
    setAgentOrder(agentList.map((agent) => agent.address));

    const counts = { blocked: 0, working: 0, done: 0, idle: 0 };
    for (const agent of agentList) counts[agent.status] = (counts[agent.status] ?? 0) + 1;

    const counter = (status) => h_flex().gap(5).items_center()
      .child(div().text_color(themeColors.dim).child(TAG[status]))
      .child(div().px(5).h(15).flex().items_center().bg(counts[status] ? (themeColors[status] ?? themeColors.dim) : themeColors.border)
        .text_color(counts[status] ? themeColors.background : themeColors.dim).font_weight(700).child(String(counts[status])));

    return v_flex()
      .relative()
      .size_full()
      .min_h(0)
      .bg(themeColors.chrome)
      // The sci-fi grid behind everything, tinted with the accent and kept faint.
      .child(svg("mods/jkr-deck/grid.svg").absolute().top(0).left(0).size_full().text_color(themeColors.accent + "40"))
      .border_b(1)
      .border_color(themeColors.border)
      .font_family(settings().font_family ?? "JetBrains Mono")
      .child(h_flex().px(14).h(30).flex_none().gap(16).items_center().text_size(10.5)
        .child(h_flex().gap(6).items_center()
          .child(div().size(7).bg(themeColors.accent))
          .child(div().font_weight(700).text_color(themeColors.foreground).child("AGENT DECK")))
        .child(div().text_color(themeColors.border).child("//"))
        .child(counter("blocked"))
        .child(counter("working"))
        .child(counter("done"))
        .child(counter("idle"))
        .child(div().flex_1())
        .child(div().text_color(themeColors.dim).child(`${agentList.length} UNITS`)))
      .when(agentList.length === 0, (el) => el.child(div().px(14).text_size(11).text_color(themeColors.dim).child("NO SIGNAL — agents appear here once they report a status.")))
      .child(div().id("deck-grid").flex_1().min_h(0).overflow_y_scrollbar()
        .child(h_flex().flex_wrap().gap(10).px(14).pt(4).pb(12)
          .children(agentList.map((agent, index) => this.card(themeColors, agent, index, now)))));
  }
}
