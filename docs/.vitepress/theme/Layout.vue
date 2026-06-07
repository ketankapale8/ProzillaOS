<script setup lang="ts">
import DefaultTheme from "vitepress/theme";
import { onMounted } from "vue";
import { useRouter } from "vitepress";
import mediumZoom from "medium-zoom";
import PackageBadge from "./PackageBadge.vue";
import DraftBanner from "./DraftBanner.vue";

const { Layout } = DefaultTheme;
const router = useRouter();

const setupMediumZoom = () => {
	mediumZoom("[data-zoomable]", {
		background: "transparent",
	});
};

onMounted(setupMediumZoom);
router.onAfterRouteChange = setupMediumZoom;
</script>

<template>
	<Layout>
		<template #doc-before>
			<PackageBadge/>
			<DraftBanner/>
		</template>
	</Layout>
</template>

<style>
.medium-zoom-overlay {
	backdrop-filter: blur(2.5rem) brightness(80%);
}

.medium-zoom-overlay,
.medium-zoom-image--opened {
	z-index: 999;
}
</style>