<template>
  <div>
    <p class="mb-3">
      Drag the bottom-right corner of the dashed box. The card responds to the width of
      <em>its container</em>, not the viewport.
    </p>
    <div class="resizer">
      <div class="cq-card">
        <div class="cq-inner">
          <div class="cq-media">🖼</div>
          <div class="cq-body">
            <h4>Container-aware card</h4>
            <p>Stacked when narrow, side-by-side when its container is at least 28rem wide.</p>
            <p>Heading size scales with <code>cqi</code> units.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.resizer {
  resize: horizontal;
  overflow: auto;
  inline-size: 100%;
  min-inline-size: 12rem;
  max-inline-size: 100%;
  border: 2px dashed rgba(var(--v-theme-primary), 0.6);
  padding: 0.75rem;
}

.cq-card {
  container-type: inline-size;
  container-name: card;
}

/* A container can't be styled by its own query, so the layout lives on a child element. */
.cq-inner {
  display: grid;
  gap: 1rem;
  padding: 1rem;
  border-radius: 8px;
  background: rgba(var(--v-theme-primary), 0.12);
}
.cq-media {
  font-size: 3rem;
  text-align: center;
}
.cq-body h4 {
  font-size: clamp(1rem, 6cqi, 1.75rem);
  margin: 0 0 0.5rem;
}
.cq-body p { margin: 0 0 0.5rem; }

@container card (min-width: 28rem) {
  .cq-inner {
    grid-template-columns: 8rem 1fr;
    align-items: center;
  }
}
</style>
