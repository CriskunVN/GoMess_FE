import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "./ui/label";

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0 border-border">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8">
            <div className="flex flex-col gap-6">
              {/* header - logo */}
              <div className="flex flex-col items-center text-center gap-2">
                <a href="/" className="mx-auto block w-fit text-center">
                  <img className="w-20" src="/public/logoapp.jpg" alt="" />
                </a>

                <h1 className="text-2xl font-bold"> Tạo tài khoản GoMess</h1>
                <p className="text-muted-foreground">
                  Chào mừng bạn 💚 Hãy đăng ký để tham gia cùng chúng tôi
                </p>
              </div>

              {/* họ và tên */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="lastname" className="block text-sm">
                    Họ
                  </Label>
                  <Input type="text" id="lastname" />
                  {/* handle err */}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="firstName" className="block text-sm">
                    Tên
                  </Label>
                  <Input type="text" id="fistName" />
                  {/* handle err */}
                </div>
              </div>
              {/* username */}

              <div className="flex flex-col gap-3">
                <Label htmlFor="username" className="block text-sm">
                  Tên đăng nhập
                </Label>
                <Input type="text" id="username" placeholder="gomess" />
                {/* handle err */}
              </div>

              {/* email */}
              <div className="flex flex-col gap-3">
                <Label htmlFor="email" className="block text-sm">
                  Email
                </Label>
                <Input type="email" id="email" placeholder="gomess@gmail.com" />
                {/* handle err */}
              </div>

              {/* password */}
              <div className="flex flex-col gap-3">
                <Label htmlFor="password" className="block text-sm">
                  Mật khẩu
                </Label>
                <Input type="password" id="password" />
                {/* handle err */}
              </div>

              {/* buttn đăng ký */}

              <Button type="submit" className=" w-full">
                Tạo tài khoản
              </Button>

              <div className="text-center text-sm">
                Bạn đã có tài khoản?{" "}
                <a href="/login" className="underline underline-offset-4">
                  Đăng nhập
                </a>
              </div>
            </div>
          </form>
          <div className="bg-muted relative hidden md:block">
            <img
              src="/public/imgLogin.jpg"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
      <div className="text-xs text-balance text px-6 text-center *:[a]:hover: text-muted-foreground *:[a]:underline *:[a]:underline-offset-4">
        Bằng cách nhấp vào tiếp tục, bạn đồng ý với{" "}
        <a href="#">Điều khoản dịch vụ</a> và{" "}
        <a href="#">Chính sách bảo mật </a>
        của chúng tôi.
      </div>
    </div>
  );
}
