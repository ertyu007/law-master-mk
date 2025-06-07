function showMaintenanceAlert() {
  Swal.fire({
    title: "กำลังปิดปรับปรุง",
    html: '<div style="color: #2b4c7e;">บทที่ 1 กำลังอยู่ในระหว่างการปรับปรุง<br>กรุณาตรวจสอบอีกครั้งในภายหลัง</div>',
    icon: "error",
    confirmButtonText: "เข้าใจแล้ว",
    confirmButtonColor: "#2b4c7e",
    background: "#f7f9fb",
    customClass: {
      title: "swal2-title-custom",
      content: "swal2-content-custom",
    },
  });
}

// เริ่มแสดงแถบโหลด
NProgress.start();

// จำลองโหลดเสร็จ (เช่น ดึงข้อมูลเสร็จ) แล้วหยุดแถบโหลด
setTimeout(() => {
  NProgress.done();
}, 2000);
