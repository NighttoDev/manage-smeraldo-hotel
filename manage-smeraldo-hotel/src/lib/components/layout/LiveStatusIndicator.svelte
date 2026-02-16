<script lang="ts">
	import { realtimeStatusStore, offlineQueueCountStore } from '$lib/stores/realtimeStatus';
</script>

<div class="flex items-center gap-1">
	{#if $realtimeStatusStore.connected}
		<span class="h-2 w-2 animate-pulse rounded-full bg-green-500 motion-reduce:animate-none"></span>
		<span class="font-sans text-xs text-green-400">Trực tiếp · Vừa cập nhật</span>
	{:else}
		<span class="h-2 w-2 rounded-full bg-gray-400"></span>
		<span class="font-sans text-xs text-gray-400">
			Ngoại tuyến — {$offlineQueueCountStore} thay đổi đang chờ
		</span>
	{/if}
</div>
