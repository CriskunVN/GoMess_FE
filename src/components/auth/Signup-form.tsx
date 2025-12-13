import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "../ui/label";
import { z } from "zod";
import { Link, useNavigate } from "react-router";
import { useAuthStore } from "@/stores/useAuthStore";

const signUpSchema = z.object({
  firstname: z.string().min(1, "Vui lòng nhập tên của bạn"),
  lastname: z.string().min(1, "Vui lòng nhập họ của bạn"),
  username: z
    .string()
    .min(3, "Tên đăng nhập phải có ít nhất 3 ký tự")
    .max(20, "Tên đăng nhập không được vượt quá 20 ký tự")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới"
    ),
  email: z.email("Vui lòng nhập địa chỉ email hợp lệ"),
  password: z
    .string()
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
    .max(100, "Mật khẩu không được vượt quá 100 ký tự"),
});

type SignUpFormValues = z.infer<typeof signUpSchema>;

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { signUp } = useAuthStore();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit = async (data: SignUpFormValues) => {
    try {
      // Xử lý dữ liệu đăng ký ở đây
      const { firstname, lastname, username, email, password } = data;

      await signUp(username, password, email, firstname, lastname);

      // Chuyển hướng đến trang đăng nhập sau khi đăng ký thành công
      navigate("/login");
    } catch (error) {
      console.error("Đăng ký không thành công:", error);
      navigate("/register");
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0 border-border">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">
              {/* header - logo */}
              <div className="flex flex-col items-center text-center gap-2">
                <a href="/" className="mx-auto block w-fit text-center">
                  <img className="w-20" src="/logoapp.jpg" alt="" />
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
                  <Input type="text" id="lastname" {...register("lastname")} />
                  {/* handle err */}
                  {errors.lastname && (
                    <p className="text-sm text-destructive">
                      {errors.lastname.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="firstName" className="block text-sm">
                    Tên
                  </Label>
                  <Input
                    type="text"
                    id="firstName"
                    {...register("firstname")}
                  />
                  {/* handle err */}
                  {errors.firstname && (
                    <p className="text-sm text-destructive">
                      {errors.firstname.message}
                    </p>
                  )}
                </div>
              </div>
              {/* username */}

              <div className="flex flex-col gap-3">
                <Label htmlFor="username" className="block text-sm">
                  Tên đăng nhập
                </Label>
                <Input
                  type="text"
                  id="username"
                  placeholder="gomess"
                  {...register("username")}
                />
                {/* handle err */}
                {errors.username && (
                  <p className="text-sm text-destructive">
                    {errors.username.message}
                  </p>
                )}
              </div>

              {/* email */}
              <div className="flex flex-col gap-3">
                <Label htmlFor="email" className="block text-sm">
                  Email
                </Label>
                <Input
                  type="email"
                  id="email"
                  placeholder="gomess@gmail.com"
                  {...register("email")}
                />
                {/* handle err */}
                {errors.email && (
                  <p className="text-sm text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* password */}
              <div className="flex flex-col gap-3">
                <Label htmlFor="password" className="block text-sm">
                  Mật khẩu
                </Label>
                <Input
                  type="password"
                  id="password"
                  {...register("password")}
                />
                {/* handle err */}
                {errors.password && (
                  <p className="text-sm text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* buttn đăng ký */}

              <Button type="submit" className=" w-full" disabled={isSubmitting}>
                Tạo tài khoản
              </Button>

              <div className="text-center text-sm">
                Bạn đã có tài khoản?{" "}
                <Link to="/login" className="underline underline-offset-4">
                  Đăng nhập
                </Link>
              </div>
            </div>
          </form>
          <div className="bg-muted relative hidden md:block">
            <img
              src="/imgLogin.jpg"
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
