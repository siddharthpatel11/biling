import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { InvoiceService } from '../../service/invoice.service';
import { Customer } from '../../model/customer';
import { Tax } from '../../model/tax';
import { Product } from '../../model/product';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { Invoice } from '../../model/invoice';
import { InvoiceProducts } from '../../model/invoiceproducts';

@Component({
  selector: 'app-create',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [ReactiveFormsModule, MatCardModule, MatButtonModule,
    MatInputModule, MatFormFieldModule, MatSelectModule, MatDatepickerModule,
    MatIconModule, MatListModule, CommonModule
  ],
  templateUrl: './create.component.html',
  styleUrl: './create.component.css'
})
export class CreateComponent implements OnInit, OnDestroy {

  title = 'Create Invoice'
  customerlist: Customer[] = []
  taxlist: Tax[] = []
  productlist: Product[] = []
  subscription = new Subscription();
  summarytotal = 0;
  summarytax = 0;
  summarynettotal = 0;
  custtaxtype = "Z";
  custtaxperc = 0;
  isEdit = false;
  keyvalue = '';

  // 🔑 Declare form here, don't initialize yet
  invoiceform!: FormGroup;

  constructor(
    private builder: FormBuilder,
    private router: Router,
    private service: InvoiceService,
    private toastr: ToastrService,
    private actroute: ActivatedRoute
  ) {}

  get invproducts() {
    return this.invoiceform.get("products") as FormArray;
  }

  ngOnInit(): void {
    // ✅ Initialize the form inside ngOnInit
    this.invoiceform = this.builder.group({
      invoiceno: this.builder.control({ value: '', disabled: true }),
      invoicedate: this.builder.control(new Date(), Validators.required),
      customerid: this.builder.control('', Validators.required),
      customername: this.builder.control(''),
      taxcode: this.builder.control(''),
      address: this.builder.control(''),
      total: this.builder.control(0),
      tax: this.builder.control(0),
      nettotal: this.builder.control(0),
      products: this.builder.array([])
    });

    this.Loadcustomer();
    this.Loadtax();
    this.Loadproducts();

    this.keyvalue = this.actroute.snapshot.paramMap.get('invoiceno') as string;
    if (this.keyvalue != null) {
      this.isEdit = true;
      this.title = 'Edit Invoice';
      this.populateeditdata(this.keyvalue);
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  SaveInvoice() {
    if (this.invoiceform.valid) {
      const _invoice: Invoice = {
        id: this.isEdit ? parseInt(this.keyvalue) : 0,
        customerid: this.invoiceform.value.customerid,
        customername: this.invoiceform.value.customername,
        deliveryaddress: this.invoiceform.value.address,
        invoicedate: this.invoiceform.value.invoicedate,
        taxcode: this.invoiceform.value.taxcode,
        taxtype: this.custtaxtype,
        taxperc: this.custtaxperc,
        total: this.invoiceform.value.total,
        tax: this.invoiceform.value.tax,
        nettotal: this.invoiceform.value.nettotal,
        products: this.invoiceform.getRawValue().products
      }

      const action$ = this.isEdit
        ? this.service.UpdateInvoice(_invoice)
        : this.service.CreateInvoice(_invoice);

      action$.subscribe(() => {
        this.toastr.success(this.isEdit ? 'Update successfully.' : 'Created successfully.', 'Success');
        this.backtolist();
      });
    }
  }

  populateeditdata(invoiceNo: string) {
    this.service.GetInvoice(invoiceNo).subscribe(item => {
      if (item) {
        for (let i = 0; i < item.products.length; i++) {
          this.addnewproduct();
        }

        this.invoiceform.setValue({
          invoiceno: item.id.toString(),
          invoicedate: item.invoicedate ? new Date(item.invoicedate) : new Date(),
          customerid: item.customerid,
          customername: item.customername,
          taxcode: item.taxcode,
          address: item.deliveryaddress,
          total: item.total,
          tax: item.tax,
          nettotal: item.nettotal,
          products: item.products
        });

        this.custtaxtype = item.taxtype;
        this.custtaxperc = item.taxperc;
        this.Summarycalculation();
      }
    });
  }

  Loadcustomer() {
    this.subscription.add(
      this.service.Getallcustomers().subscribe(item => this.customerlist = item)
    );
  }

  Loadtax() {
    this.subscription.add(
      this.service.Getalltaxes().subscribe(item => this.taxlist = item)
    );
  }

  Loadproducts() {
    this.subscription.add(
      this.service.Getallproducts().subscribe(item => this.productlist = item)
    );
  }

  Customerchange(customerid: string) {
    const sub = this.service.Getcustomer(customerid).subscribe(item => {
      if (item) {
        this.invoiceform.patchValue({
          address: item.address,
          customername: item.name,
          taxcode: item.taxcode
        });
        this.addnewproduct();
        this.Taxchange(item.taxcode);
      }
    });
    this.subscription.add(sub);
  }

  Taxchange(taxcode: string) {
    this.service.Gettax(taxcode).subscribe(item => {
      if (item) {
        this.custtaxtype = item.type;
        this.custtaxperc = item.perc;
        this.Summarycalculation();
      }
    });
  }

  productchange(index: number) {
    const productForm = this.invproducts.at(index) as FormGroup;
    const productcode = productForm.get("productid")?.value;

    const sub = this.service.Getproduct(productcode).subscribe(item => {
      if (item) {
        productForm.patchValue({
          name: item.name,
          price: item.price
        });
        this.productcalulate(index);
      }
    });

    this.subscription.add(sub);
  }

  productcalulate(index: number) {
    const productForm = this.invproducts.at(index) as FormGroup;
    const qty = productForm.get("qty")?.value || 0;
    const price = productForm.get("price")?.value || 0;
    const total = qty * price;
    productForm.get("total")?.setValue(total);
    this.Summarycalculation();
  }

  Summarycalculation() {
    const products = this.invoiceform.getRawValue().products;
    let sumtotal = 0;

    products.forEach((x: any) => {
      sumtotal += x.total;
    });

    let sumtax = 0;
    let sumnettotal = 0;

    if (this.custtaxtype === 'E') {
      sumtax = (this.custtaxperc / 100) * sumtotal;
      sumnettotal = sumtotal + sumtax;
    } else if (this.custtaxtype === 'I') {
      sumtax = sumtotal - (sumtotal * (100 / (100 + this.custtaxperc)));
      sumnettotal = sumtotal;
    } else {
      sumtax = 0;
      sumnettotal = sumtotal;
    }

    this.invoiceform.patchValue({
      total: sumtotal,
      tax: sumtax,
      nettotal: sumnettotal
    });

    this.summarytotal = sumtotal;
    this.summarytax = sumtax;
    this.summarynettotal = sumnettotal;
  }

  Deleteproduct(index: number) {
    if (confirm("Do you want to remove?")) {
      this.invproducts.removeAt(index);
      this.Summarycalculation();
    }
  }

  addnewproduct() {
    if (this.isEdit || this.invoiceform.value.customerid) {
      this.invproducts.push(this.Generaterow());
    } else {
      this.toastr.warning("Select customer then add products", "Please choose customer");
    }
  }

  Generaterow() {
    return this.builder.group({
      productid: ['', Validators.required],
      name: [''],
      qty: [1],
      price: [0],
      total: [{ value: 0, disabled: true }]
    });
  }

  backtolist() {
    this.router.navigateByUrl('/invoice');
  }

}
