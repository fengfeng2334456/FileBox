// FileBox - Vue Application
new Vue({
    el: '#app',
    data: {
        lang: 'zh',
        iconList: iconList,
        defaultData: defaultData,
        defaultDataEn: defaultDataEn,
        categories: [],
        categoryDialogVisible: false,
        categoryDialogTitle: '',
        editingCatIdx: -1,
        categoryForm: { name:'', icon:'fa-solid fa-folder' },
        folderDialogVisible: false,
        folderDialogTitle: '',
        editingCatIdx_f: -1,
        editingFolderIdx: -1,
        folderForm: { categoryIdx:0, name:'', path:'', icon:'fa-solid fa-folder', cover:'' }
    },
    mounted() {
        const savedLang = localStorage.getItem('filebox_lang');
        if (savedLang && (savedLang === 'zh' || savedLang === 'en')) {
            this.lang = savedLang;
        }
        this.loadData();
        this.renderNav();
        this.renderContent();
        this.updateScrollSpy();
    },
    methods: {
        t(key) {
            return i18n[this.lang][key] || key;
        },
        toggleLang() {
            this.lang = this.lang === 'zh' ? 'en' : 'zh';
            localStorage.setItem('filebox_lang', this.lang);
            this.loadData();
            this.renderNav();
            this.renderContent();
        },
        loadData() {
            const s = localStorage.getItem('my_folders_data_v2');
            if (s) { try { this.categories = JSON.parse(s); return; } catch(e){} }
            this.categories = JSON.parse(JSON.stringify(this.lang === 'en' ? this.defaultDataEn : this.defaultData));
        },
        saveData() { localStorage.setItem('my_folders_data_v2', JSON.stringify(this.categories)); },
        renderNav() {
            const el = document.getElementById('navLinks');
            if (!el) return;
            el.innerHTML = '';
            this.categories.forEach((g, i) => {
                const a = document.createElement('a');
                a.textContent = g.category;
                a.href = '#cat-'+i;
                if (i===0) a.classList.add('active');
                a.onclick = e => {
                    e.preventDefault();
                    document.getElementById('cat-'+i).scrollIntoView({behavior:'smooth'});
                };
                el.appendChild(a);
            });
        },
        renderContent() {
            const el = document.getElementById('content');
            if (!el) return;
            el.innerHTML = '';
            this.categories.forEach((group, ci) => {
                const sec = document.createElement('div');
                sec.className = 'category';
                sec.id = 'cat-'+ci;
                sec.innerHTML = '<div class="category-header"><div class="category-icon"><i class="'+group.icon+'"></i></div><span class="category-title">'+group.category+'</span><div class="category-actions"><button class="btn-sort" data-a="sf" data-i="'+ci+'" title="'+this.t('sortByName')+'"><i class="fa-solid fa-arrow-down-a-z"></i></button><button class="btn-icon edit" data-a="ec" data-i="'+ci+'"><i class="fa-solid fa-pen"></i></button><button class="btn-icon del" data-a="dc" data-i="'+ci+'"><i class="fa-solid fa-trash-can"></i></button></div></div>';
                const grid = document.createElement('div');
                grid.className = 'grid';
                grid.dataset.categoryIdx = ci;
                
                // 设置分类为拖放目标
                grid.addEventListener('dragover', e => this.handleDragOver(e, grid));
                grid.addEventListener('dragleave', e => this.handleDragLeave(e, grid));
                grid.addEventListener('drop', e => this.handleDrop(e, ci));
                
                group.folders.forEach((f, fi) => {
                    const card = document.createElement('div');
                    card.className = 'folder-card';
                    card.title = f.path;
                    card.draggable = true;
                    card.dataset.fromCategory = ci;
                    card.dataset.folderIdx = fi;
                    
                    // 拖拽事件
                    card.addEventListener('dragstart', e => this.handleDragStart(e, card));
                    card.addEventListener('dragend', e => this.handleDragEnd(e, card));
                    
                    card.onclick = e => { 
                        if (!e.target.closest('.card-actions')) this.openFolder(ci, fi); 
                    };
                    
                    const iconHtml = f.cover
                        ? '<div class="folder-icon"><img src="'+f.cover+'"></div>'
                        : '<div class="folder-icon"><i class="'+f.icon+'"></i></div>';
                    card.innerHTML = '<div class="card-actions"><button class="btn-icon edit" data-a="ef" data-c="'+ci+'" data-f="'+fi+'"><i class="fa-solid fa-pen"></i></button><button class="btn-icon del" data-a="df" data-c="'+ci+'" data-f="'+fi+'"><i class="fa-solid fa-trash-can"></i></button></div>'+iconHtml+'<div class="folder-name">'+f.name+'</div><div class="folder-path">'+(f.path.split('/').pop()||f.path.split('\\').pop())+'</div>';
                    grid.appendChild(card);
                });
                const add = document.createElement('div');
                add.className = 'folder-card-add';
                add.onclick = () => this.openAddFolderModal(ci);
                add.innerHTML = '<div class="add-icon"><i class="fa-solid fa-plus"></i></div><div class="add-text">'+this.t('addFolder')+'</div>';
                grid.appendChild(add);
                sec.appendChild(grid);
                el.appendChild(sec);
            });
            el.querySelectorAll('[data-a]').forEach(btn => {
                btn.onclick = e => {
                    e.stopPropagation();
                    const a = btn.dataset.a;
                    const c = parseInt(btn.dataset.c);
                    const f = btn.dataset.f !== undefined ? parseInt(btn.dataset.f) : null;
                    const i = parseInt(btn.dataset.i);
                    if (a==='ec') this.openEditCategoryModal(i);
                    else if (a==='dc') this.confirmDeleteCategory(i);
                    else if (a==='ef') this.openEditFolderModal(c, f);
                    else if (a==='df') this.confirmDeleteFolder(c, f);
                    else if (a==='sf') this.sortFolders(i);
                };
            });
        },
        handleDragStart(e, card) {
            card.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('fromCategory', card.dataset.fromCategory);
            e.dataTransfer.setData('folderIdx', card.dataset.folderIdx);
        },
        handleDragEnd(e, card) {
            card.classList.remove('dragging');
            document.querySelectorAll('.grid').forEach(g => g.classList.remove('drag-over'));
        },
        handleDragOver(e, grid) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            grid.classList.add('drag-over');
        },
        handleDragLeave(e, grid) {
            if (!grid.contains(e.relatedTarget)) {
                grid.classList.remove('drag-over');
            }
        },
        handleDrop(e, toCategoryIdx) {
            e.preventDefault();
            document.querySelectorAll('.grid').forEach(g => g.classList.remove('drag-over'));
            
            const fromCategoryIdx = parseInt(e.dataTransfer.getData('fromCategory'));
            const folderIdx = parseInt(e.dataTransfer.getData('folderIdx'));
            
            if (fromCategoryIdx === toCategoryIdx) return;
            
            const folder = this.categories[fromCategoryIdx].folders[folderIdx];
            this.categories[fromCategoryIdx].folders.splice(folderIdx, 1);
            this.categories[toCategoryIdx].folders.push(folder);
            
            this.saveData();
            this.renderContent();
            this.$message.success(this.t('moveSuccess'));
        },
        openAddCategoryModal() {
            this.editingCatIdx = -1;
            this.categoryDialogTitle = this.t('add') + this.t('categoryName');
            this.categoryForm = { name:'', icon:'fa-solid fa-folder' };
            this.categoryDialogVisible = true;
        },
        sortFolders(ci) {
            const folders = this.categories[ci].folders;
            const btn = document.querySelector('[data-a="sf"][data-i="'+ci+'"] i');
            const isAsc = btn && btn.classList.contains('fa-arrow-down-a-z');
            folders.sort((a, b) => isAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));
            this.saveData();
            this.renderContent();
        },
        openEditCategoryModal(i) {
            this.editingCatIdx = i;
            this.categoryDialogTitle = this.t('edit') + this.t('categoryName');
            this.categoryForm = { name:this.categories[i].category, icon:this.categories[i].icon||'fa-solid fa-folder' };
            this.categoryDialogVisible = true;
        },
        saveCategory() {
            if (!this.categoryForm.name.trim()) { this.$message.warning(this.t('inputCategoryName')); return; }
            if (this.editingCatIdx === -1) {
                this.categories.push({ category:this.categoryForm.name, icon:this.categoryForm.icon, folders:[] });
            } else {
                this.categories[this.editingCatIdx].category = this.categoryForm.name;
                this.categories[this.editingCatIdx].icon = this.categoryForm.icon;
            }
            this.saveData();
            this.renderNav();
            this.renderContent();
            this.categoryDialogVisible = false;
            this.$message.success(this.t('saveSuccess'));
        },
        deleteCategory() {
            this.$confirm(
                this.t('deleteCategoryConfirm').replace('{name}', this.categories[this.editingCatIdx].category),
                this.t('prompt'),
                { confirmButtonText:this.t('confirm'), cancelButtonText:this.t('cancel'), type:'warning' }
            ).then(() => {
                this.categories.splice(this.editingCatIdx, 1);
                this.saveData();
                this.renderNav();
                this.renderContent();
                this.categoryDialogVisible = false;
                this.$message.success(this.t('deleteSuccess'));
            });
        },
        confirmDeleteCategory(i) {
            this.$confirm(
                this.t('deleteCategoryConfirm').replace('{name}', this.categories[i].category),
                this.t('prompt'),
                { confirmButtonText:this.t('confirm'), cancelButtonText:this.t('cancel'), type:'warning' }
            ).then(() => {
                this.categories.splice(i, 1);
                this.saveData();
                this.renderNav();
                this.renderContent();
                this.$message.success(this.t('deleteSuccess'));
            });
        },
        openAddFolderModal(ci) {
            this.editingCatIdx_f = ci;
            this.editingFolderIdx = -1;
            this.folderDialogTitle = this.t('add') + this.t('folderName');
            this.folderForm = { categoryIdx:ci, name:'', path:'', icon:'fa-solid fa-folder', cover:'' };
            this.folderDialogVisible = true;
        },
        openEditFolderModal(ci, fi) {
            this.editingCatIdx_f = ci;
            this.editingFolderIdx = fi;
            const f = this.categories[ci].folders[fi];
            this.folderDialogTitle = this.t('edit') + this.t('folderName');
            this.folderForm = { categoryIdx:ci, name:f.name, path:f.path, icon:f.icon||'fa-solid fa-folder', cover:f.cover||'' };
            this.folderDialogVisible = true;
        },
        saveFolder() {
            if (!this.folderForm.name.trim()) { this.$message.warning(this.t('inputFolderName')); return; }
            if (!this.folderForm.path.trim()) { this.$message.warning(this.t('inputFolderPath')); return; }
            const tc = this.folderForm.categoryIdx;
            const fd = { name:this.folderForm.name, path:this.folderForm.path, icon:this.folderForm.icon, cover:this.folderForm.cover||'' };
            if (this.editingFolderIdx === -1) {
                this.categories[tc].folders.push(fd);
            } else {
                this.categories[this.editingCatIdx_f].folders.splice(this.editingFolderIdx, 1);
                if (tc !== this.editingCatIdx_f) {
                    this.categories[tc].folders.push(fd);
                } else {
                    this.categories[this.editingCatIdx_f].folders.splice(this.editingFolderIdx, 0, fd);
                }
            }
            this.saveData();
            this.renderContent();
            this.folderDialogVisible = false;
            this.$message.success(this.t('saveSuccess'));
        },
        deleteFolder() {
            this.$confirm(
                this.t('deleteFolderConfirm').replace('{name}', this.categories[this.editingCatIdx_f].folders[this.editingFolderIdx].name),
                this.t('prompt'),
                { confirmButtonText:this.t('confirm'), cancelButtonText:this.t('cancel'), type:'warning' }
            ).then(() => {
                this.categories[this.editingCatIdx_f].folders.splice(this.editingFolderIdx, 1);
                this.saveData();
                this.renderContent();
                this.folderDialogVisible = false;
                this.$message.success(this.t('deleteSuccess'));
            });
        },
        confirmDeleteFolder(ci, fi) {
            this.$confirm(
                this.t('deleteFolderConfirm').replace('{name}', this.categories[ci].folders[fi].name),
                this.t('prompt'),
                { confirmButtonText:this.t('confirm'), cancelButtonText:this.t('cancel'), type:'warning' }
            ).then(() => {
                this.categories[ci].folders.splice(fi, 1);
                this.saveData();
                this.renderContent();
                this.$message.success(this.t('deleteSuccess'));
            });
        },
        async browseFolder() {
            if ('showDirectoryPicker' in window) {
                try {
                    const h = await window.showDirectoryPicker();
                    this.folderForm.path = '[FS]'+h.name;
                    if (!this.folderForm.name.trim()) this.folderForm.name = h.name;
                } catch(e) {}
            } else {
                const inp = document.createElement('input');
                inp.type = 'file';
                inp.webkitdirectory = true;
                inp.nwdirectory = true;
                inp.onchange = () => {
                    if (inp.files.length > 0) {
                        const n = inp.files[0].webkitRelativePath.split('/')[0];
                        this.folderForm.path = inp.files[0].path || n;
                        if (!this.folderForm.name.trim()) this.folderForm.name = n;
                    }
                };
                inp.click();
            }
        },
        uploadCover() {
            this.$refs.coverInput.click();
        },
        handleCoverChange(e) {
            const file = e.target.files[0];
            if (!file) return;
            if (!file.type.startsWith('image/')) {
                this.$message.warning(this.t('selectImage'));
                return;
            }
            if (file.size > 2 * 1024 * 1024) {
                this.$message.warning(this.t('imageSizeLimit'));
                return;
            }
            const reader = new FileReader();
            reader.onload = (e) => {
                this.folderForm.cover = e.target.result;
                this.$message.success(this.t('uploadSuccess'));
            };
            reader.readAsDataURL(file);
            e.target.value = '';
        },
        removeCover() {
            this.folderForm.cover = '';
        },
        openFolder(ci, fi) {
            const p = this.categories[ci].folders[fi].path;
            if (p.startsWith('[FS]')) { this.$message.warning(this.t('needReauthorize')); return; }
            const a = document.createElement('a');
            a.href = 'file:///' + p.replace(/\\/g, '/');
            a.target = '_blank';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        },
        updateScrollSpy() {
            const navs = document.querySelectorAll('#navLinks a');
            const secs = document.querySelectorAll('.category');
            window.onscroll = () => {
                let c = 0;
                secs.forEach((s, i) => { if (window.scrollY >= s.offsetTop - 120) c = i; });
                navs.forEach((a, i) => a.classList.toggle('active', i === c));
            };
        }
    }
});
