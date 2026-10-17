const modules = {
  ADMIN: ['dashboard', 'students', 'teachers', 'staff', 'guardian', 'classes', 'curriculum', 'homework', 'examinations', 'fees', 'attendance', 'holidays', 'leaves', 'certificate', 'library', 'accounts', 'hrm', 'notice', 'banners', 'gallery', 'transport'],
  PRINCIPAL: ['dashboard', 'students', 'teachers', 'staff', 'guardian', 'classes', 'curriculum', 'homework', 'examinations', 'attendance', 'holidays', 'leaves', 'certificate', 'library', 'hrm', 'notice', 'banners', 'gallery', 'transport'],
  TEACHER: ['dashboard', 'students', 'curriculum', 'homework', 'examinations', 'attendance-student', 'holidays', 'leaves-request', 'notice', 'classes-timetable'],
  ACCOUNTANT: ['dashboard', 'fees', 'accounts', 'holidays', 'notice'],
  LIBRARIAN: ['dashboard', 'library', 'holidays', 'notice'],
};

export function roleFor(user) {
  const role = String(user?.role || user?.userType || '').toUpperCase().replace(/^ROLE_/, '');
  return ['MASTER_ADMIN', 'SUPER_ADMIN', 'ADMIN'].includes(role) ? 'ADMIN' : role;
}

export function canAccess(user, key) {
  return (modules[roleFor(user)] || []).some(allowed => key === allowed || key.startsWith(`${allowed}-`));
}

export function visibleMenu(user, items) {
  return items.flatMap(item => {
    const subItems = item.subItems?.filter(sub => canAccess(user, sub.key));
    if (!canAccess(user, item.key) && !subItems?.length) return [];
    return [{ ...item, ...(subItems ? { subItems } : {}) }];
  });
}

