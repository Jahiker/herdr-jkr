// Picks a space's group. props { id, overlay }.
// Groups live in shared state, read by jkr-spaces:
//   "space.groupNames": ordered names; "space.groups": spaceId -> name.
import { View, div, svg } from "gpui-kit";
import { v_flex, h_flex, InputState, Input } from "gpui-base";
import { props, closeOverlay, theme, shared, setShared } from "herdr";

// jkr-deck draws everything with square corners; other layouts keep the rounded ones.
const corner = (radius) => (shared("layout") === "jkr-deck" ? 0 : radius);


// Same defaults as jkr-spaces (mods can't import each other).
const DEFAULT_GROUPS = ["Work", "Clients", "Personal"];
const groupNames = () => shared("space.groupNames") ?? DEFAULT_GROUPS;

export default class GroupPicker extends View {
  init() {
    this.newName = "";
    this.input = InputState.new({ placeholder: "New group… (Enter)", value: "" });
    this.input.on("change", (_e, cx) => { this.newName = this.input.value(); cx.notify(); });
    this.input.on("submit", () => this.create());
  }

  assign(groupName) {
    const { id, overlay } = props();
    const assignments = { ...(shared("space.groups") ?? {}) };
    if (groupName) assignments[id] = groupName;
    else delete assignments[id];
    setShared("space.groups", assignments);
    closeOverlay(overlay);
  }

  create() {
    const groupName = this.newName.trim();
    if (!groupName) return;
    const names = groupNames();
    const existing = names.find((name) => name.toLowerCase() === groupName.toLowerCase());
    if (!existing) setShared("space.groupNames", [...names, groupName]);
    this.assign(existing ?? groupName);
  }

  render() {
    const t = theme();
    const current = (shared("space.groups") ?? {})[props()?.id] ?? null;
    const option = (key, label, value) => h_flex().id(`group-${key}`).h(30).px(8).gap(9).rounded(corner(7)).items_center()
      .text_color(t.foreground).hover((s) => s.bg(t.hover)).cursor_pointer()
      .on_click(() => this.assign(value))
      .child(svg(`mods/workspace-chrome/${value ? "folder" : "minus"}.svg`).size(14).flex_none().text_color(t.muted))
      .child(div().flex_1().truncate().child(label))
      .when(current === value, (el) => el.child(svg("mods/workspace-chrome/check.svg").size(13).flex_none().text_color(t.accent)));
    return v_flex().id("group-picker").w_full().min_h(0).p(5).bg(t.popover).text_size(12.8)
      .on_key_down((e, _cx) => { if (e.key === "escape") closeOverlay(props().overlay); })
      .child(div().px(8).pt(4).pb(6).text_size(11).text_color(t.dim).child("Move to group"))
      .children(groupNames().map((name, index) => option(index, name, name)))
      .child(option("none", "No group", null))
      .child(div().mx(7).my(4).h(1).bg(t.border))
      .child(Input.new(this.input).h(30).px(8).rounded(corner(7))
        .border_1().border_color(t.input).bg(t.background).text_size(12.5).text_color(t.foreground));
  }
}
