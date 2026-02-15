<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let showForm = $state(false);

	// Capture initial form value — superForm manages its own reactive state from here
	const initialForm = data.form;
	const { form, errors, enhance, submitting, message } = superForm(initialForm, {
		onUpdated({ form }) {
			if (form.message?.type === 'success') {
				showForm = false;
			}
		}
	});

	const roleLabels: Record<string, string> = {
		manager: 'Quản lý',
		reception: 'Lễ tân',
		housekeeping: 'Dọn phòng'
	};

	const roleBadgeClass: Record<string, string> = {
		manager: 'bg-primary text-white',
		reception: 'bg-accent text-white',
		housekeeping: 'bg-gray-200 text-gray-700'
	};
</script>

<svelte:head>
	<title>Quản lý nhân viên — Smeraldo Hotel</title>
</svelte:head>

<div class="mx-auto max-w-4xl px-4 py-6">
	<!-- Page header -->
	<div class="mb-6 flex items-center justify-between">
		<h1 class="font-sans text-xl font-bold text-high-contrast">Quản lý nhân viên</h1>
		<button
			type="button"
			onclick={() => (showForm = !showForm)}
			class="rounded-md bg-primary px-4 py-2 font-sans text-sm font-medium text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2"
		>
			{showForm ? 'Hủy' : '+ Thêm nhân viên'}
		</button>
	</div>

	<!-- Add Staff Form (collapsible) -->
	{#if showForm}
		<div class="mb-6 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
			<h2 class="mb-4 font-sans text-base font-semibold text-high-contrast">Thêm nhân viên mới</h2>

			{#if $message?.type === 'error'}
				<div
					class="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
					role="alert"
				>
					{$message.text}
				</div>
			{/if}

			<form
				method="POST"
				action="?/createStaff"
				use:enhance
				class="grid grid-cols-1 gap-4 sm:grid-cols-2"
			>
				<!-- Full Name -->
				<div>
					<label for="full_name" class="mb-1 block font-sans text-sm font-medium text-high-contrast">
						Họ và tên <span class="text-red-500">*</span>
					</label>
					<input
						id="full_name"
						name="full_name"
						type="text"
						required
						bind:value={$form.full_name}
						aria-invalid={$errors.full_name ? 'true' : undefined}
						class="w-full rounded-md border border-gray-300 px-3 py-2 font-sans text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
						placeholder="Nguyễn Văn A"
					/>
					{#if $errors.full_name}
						<p class="mt-1 font-sans text-xs text-red-600">{$errors.full_name}</p>
					{/if}
				</div>

				<!-- Email -->
				<div>
					<label for="email" class="mb-1 block font-sans text-sm font-medium text-high-contrast">
						Email <span class="text-red-500">*</span>
					</label>
					<input
						id="email"
						name="email"
						type="email"
						required
						bind:value={$form.email}
						aria-invalid={$errors.email ? 'true' : undefined}
						class="w-full rounded-md border border-gray-300 px-3 py-2 font-sans text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
						placeholder="nhanvien@smeraldo.vn"
					/>
					{#if $errors.email}
						<p class="mt-1 font-sans text-xs text-red-600">{$errors.email}</p>
					{/if}
				</div>

				<!-- Password -->
				<div>
					<label
						for="new_password"
						class="mb-1 block font-sans text-sm font-medium text-high-contrast"
					>
						Mật khẩu <span class="text-red-500">*</span>
					</label>
					<input
						id="new_password"
						name="password"
						type="password"
						required
						minlength="8"
						autocomplete="new-password"
						bind:value={$form.password}
						aria-invalid={$errors.password ? 'true' : undefined}
						class="w-full rounded-md border border-gray-300 px-3 py-2 font-sans text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
						placeholder="Tối thiểu 8 ký tự"
					/>
					{#if $errors.password}
						<p class="mt-1 font-sans text-xs text-red-600">{$errors.password}</p>
					{/if}
				</div>

				<!-- Role -->
				<div>
					<label for="role" class="mb-1 block font-sans text-sm font-medium text-high-contrast">
						Vai trò <span class="text-red-500">*</span>
					</label>
					<select
						id="role"
						name="role"
						required
						bind:value={$form.role}
						aria-invalid={$errors.role ? 'true' : undefined}
						class="w-full rounded-md border border-gray-300 px-3 py-2 font-sans text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
					>
						<option value="" disabled>Chọn vai trò</option>
						<option value="manager">Quản lý</option>
						<option value="reception">Lễ tân</option>
						<option value="housekeeping">Dọn phòng</option>
					</select>
					{#if $errors.role}
						<p class="mt-1 font-sans text-xs text-red-600">{$errors.role}</p>
					{/if}
				</div>

				<!-- Submit -->
				<div class="sm:col-span-2">
					<button
						type="submit"
						disabled={$submitting}
						class="min-h-[44px] min-w-[140px] rounded-md bg-primary px-5 py-2 font-sans text-sm font-medium text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
					>
						{#if $submitting}
							<span class="inline-flex items-center gap-2">
								<svg
									class="h-4 w-4 animate-spin"
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
								>
									<circle
										class="opacity-25"
										cx="12"
										cy="12"
										r="10"
										stroke="currentColor"
										stroke-width="4"
									></circle>
									<path
										class="opacity-75"
										fill="currentColor"
										d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
									></path>
								</svg>
								Đang tạo...
							</span>
						{:else}
							Tạo tài khoản
						{/if}
					</button>
				</div>
			</form>
		</div>
	{/if}

	<!-- Staff Table -->
	<div class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
		{#if data.staff.length === 0}
			<div class="px-6 py-12 text-center font-sans text-sm text-gray-500">
				Chưa có nhân viên nào. Nhấn "Thêm nhân viên" để bắt đầu.
			</div>
		{:else}
			<table class="w-full text-left">
				<thead class="border-b border-gray-200 bg-gray-50">
					<tr>
						<th class="px-4 py-3 font-sans text-xs font-semibold uppercase tracking-wide text-gray-500"
							>Họ và tên</th
						>
						<th class="px-4 py-3 font-sans text-xs font-semibold uppercase tracking-wide text-gray-500"
							>Vai trò</th
						>
						<th class="px-4 py-3 font-sans text-xs font-semibold uppercase tracking-wide text-gray-500"
							>Trạng thái</th
						>
						<th class="px-4 py-3 font-sans text-xs font-semibold uppercase tracking-wide text-gray-500"
							></th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-100">
					{#each data.staff as member (member.id)}
						<tr class="hover:bg-gray-50">
							<td class="px-4 py-3 font-sans text-sm text-high-contrast">{member.full_name}</td>
							<td class="px-4 py-3">
								<span
									class="inline-flex items-center rounded-full px-2.5 py-0.5 font-sans text-xs font-medium {roleBadgeClass[member.role] ?? 'bg-gray-100 text-gray-700'}"
								>
									{roleLabels[member.role] ?? member.role}
								</span>
							</td>
							<td class="px-4 py-3">
								{#if member.is_active}
									<span
										class="inline-flex items-center gap-1 font-sans text-xs font-medium text-green-700"
									>
										<span class="h-1.5 w-1.5 rounded-full bg-green-500"></span>
										Hoạt động
									</span>
								{:else}
									<span
										class="inline-flex items-center gap-1 font-sans text-xs font-medium text-red-600"
									>
										<span class="h-1.5 w-1.5 rounded-full bg-red-400"></span>
										Không hoạt động
									</span>
								{/if}
							</td>
							<td class="px-4 py-3 text-right">
								<!-- eslint-disable svelte/no-navigation-without-resolve -->
								<a
									href="/staff/{member.id}"
									class="font-sans text-sm font-medium text-primary hover:underline"
								>
									Chỉnh sửa
								</a>
								<!-- eslint-enable svelte/no-navigation-without-resolve -->
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
	</div>
</div>
